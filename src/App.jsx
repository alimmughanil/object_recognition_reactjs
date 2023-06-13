import { useEffect, useState } from 'react'
import * as tf from "@tensorflow/tfjs"
import * as cocoModel from "@tensorflow-models/coco-ssd"
import Webcam from 'react-webcam'

function App() {
  const [model, setModel] = useState()
  const [objectName, setObjectName] = useState()
  const [objectScore, setObjectScore] = useState()
  const [openCamera, setOpenCamera] = useState(true)

  async function loadModel() {
    const dataset = await cocoModel.load()
    setModel(dataset)
    console.log('dataset ready....');
  }

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
        setObjectName(object.class)
        setObjectScore(object.score)
      })
    }
  }
  return (
    <div className="flex flex-col gap-4 items-center min-h-screen justify-center">
      <div className={`flex gap-4 ${!model ? "flex-col" : ""}`}>
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
          <button
            className={`bg-blue-600 text-gray-100 px-4 py-2 rounded-lg loading`}
            onClick={() => getDetect()}
          >
            Deteksi Objek
          </button>
        }
      </div>
      <div className="flex justify-center flex-col items-center">
        <p className='text-xl uppercase font-semibold'>{objectName?.toString()}</p>
        <p className='text-gray-600'>{objectScore?.toString().slice(0, 4)}</p>
      </div>
      {openCamera ?
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
        : null
      }
    </div>
  )
}

export default App
