import { useEffect, useRef, useState } from 'react'
import * as tf from "@tensorflow/tfjs"
import * as cocoModel from "@tensorflow-models/coco-ssd"
import Webcam from 'react-webcam'

function App() {
  const [model, setModel] = useState()
  const [objectName, setObjectName] = useState()
  const [objectScore, setObjectScore] = useState()
  const [openCamera, setOpenCamera] = useState(true)
  const [position, setPosition] = useState(null)
  const detectBtn = useRef()

  async function loadModel() {
    const dataset = await cocoModel.load()
    setModel(dataset)
    console.log('dataset ready....');
  }

  useEffect(() => {
    if (openCamera) {
      const interval = setInterval(() => {
        detectBtn.current?.click()
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [openCamera]);

  useEffect(() => {
    tf.ready().then(() => {
      loadModel()
    })
  }, [])

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environtment"
  };

  const getDetect = async () => {
    const objects = await model.detect(document.getElementById('video'))
    if (objects.length > 0) {
      objects.map(object => {
        setPosition({
          ...position,
          left: object.bbox[0],
          top: object.bbox[1],
          width: object.bbox[2],
          height: object.bbox[3],
        })
        setObjectName(object.class)
        setObjectScore(parseFloat(object.score) * 100)
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 items-center min-h-screen justify-center relative">
      <div className={`flex gap-4 z-50 ${!model ? "flex-col" : ""}`}>
        <button
          className={`bg-red-600 text-gray-100 px-4 py-2 rounded-lg loading`}
          onClick={() => setOpenCamera((state) => !state)}
        >
          {openCamera
            ? <span>Tutup Kamera</span>
            : <span>Buka Kamera</span>
          }
        </button>
        {!model ?
          <p className='animate-bounce text-xl font-semibold'>Loading Dataset....</p>
          :
          openCamera ?
            <button
              ref={detectBtn}
              className={`bg-blue-600 text-gray-100 px-4 py-2 rounded-lg loading`}
              onClick={() => getDetect()}
            >
              Deteksi Objek
            </button> : null

        }
      </div>
      {openCamera ?
        <>
          <div className="flex justify-center flex-col items-center">
            <p className='text-xl uppercase font-semibold z-50'>{objectName?.toString()}</p>
            <p className='text-gray-600'>{objectScore ? `${objectScore.toString().slice(0, 5)} %` : ""}</p>
          </div>
          <Webcam
            id="video"
            className='rounded-lg w-full sm:w-[50rem]'
            audio={false}
            imageSmoothing={true}
            onChange={() => getDetect()}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
          >
          </Webcam>
          <div className={`box-content border-2 border-red-600 absolute scale-75 rounded-lg`}
            style={{
              width: position?.width,
              height: position?.height,
              top: position?.top,
              left: position?.left
            }}
          ></div>
        </>
        : null
      }
    </div>
  )
}

export default App
