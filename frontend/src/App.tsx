import axios from "axios";
import { Buffer } from 'buffer';
import qs from "qs";
import { useState } from "react";
import "./App.css";

const baseURL = "http://127.0.0.1:8000/";

const WIFI_ENDPOINT = "encodeWifi";
const TEXT_ENDPOINT = 'encodeText';
const ENCODE_TYPE: EncodeType[] = ["Wifi", "Text"]

interface WifiPayload {
  name: string;
  connection_type: string;
  password: string;
}

type EncodeType = "Wifi" | "Text";

interface TextPayload {
  text: string;
}

function App() {
  const [formSubmitted, updateFormSubmitted] = useState<boolean>(false);

  const [encodeType, setEncodeType] = useState<EncodeType>("Wifi");

  const [response, setResponse] = useState("");
  const [wifiInput, setWifiInput] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");

  async function encodeWifi() {
    updateFormSubmitted(true);

    const payload: WifiPayload = {
      name: wifiInput,
      connection_type: "WPA",
      password: passwordInput
    }
    axios.post(baseURL + WIFI_ENDPOINT, qs.stringify(payload), {
      responseType: "arraybuffer",
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    }).then(rsp => {
      if(rsp.status === 200) {
        let base64ImageString = Buffer.from(rsp.data, 'binary').toString('base64');
        let srcValue = "data:image/png;base64,"+base64ImageString;
        setResponse(srcValue);
      }
    })
  }

  async function encodeText() {
    updateFormSubmitted(true);

    const payload: TextPayload = {
      text: textInput
    }
    axios.post(baseURL + TEXT_ENDPOINT, qs.stringify(payload), {
      responseType: "arraybuffer",
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    }).then(rsp => {
      if(rsp.status === 200) {
        let base64ImageString = Buffer.from(rsp.data, 'binary').toString('base64');
        let srcValue = "data:image/png;base64,"+base64ImageString;
        setResponse(srcValue);
      }
    })
  }

  return (
    <div className="m-auto bg-white flex justify-center items-center h-screen gap-20 flex-col lg:flex-row">
      <form className="w-3/4 bg-slate-100 flex justify-center flex-col rounded-xl shadow-sm shadow-slate-600 py-10 lg:w-1/3">
        <h1 className="text-center text-4xl my-8 uppercase font-semibold text-emerald-700 max-w-2xl px-4 m-auto">
          Quick Response Things
        </h1>

        <div className="my-4 mx-4 flex flex-col md:mx-10">
          <label htmlFor="encode-type" className="text-emerald-700">Data Type to Encode:</label>

          <select 
            name="encode-type"
            className="rounded-md border-2 border-orange-400 text-slate-700 text-sm w-full h-9 text-md p-2"
            id="encode-type"
            onChange={(e) => {
              const index: number = Number(e.target.value);
              setEncodeType(ENCODE_TYPE[index]);
            }}
          >
            <option selected value="0">Wifi</option>
            <option value="1">Text</option>
          </select>
        </div>
       {
        encodeType === "Wifi" &&
        <>
          <div className="my-4 mx-4 flex flex-col md:mx-10">
            <label className="text-emerald-700">Wifi Name:</label>
            <input
              type="text"
              onChange={(e) => setWifiInput(e.target.value)}
              className="rounded-md border-2 border-orange-400 text-slate-700 text-sm w-full h-9 text-md p-2"
            ></input>
          </div>
          <div className="my-4 mx-4 flex flex-col md:mx-10">
            <label className="text-emerald-700">Password</label>
            <input
              type="text"
              onChange={(e) => setPasswordInput(e.target.value)}
              className="rounded-md border-2 border-orange-400 text-slate-700 text-sm w-full  h-9 text-md p-2"
              ></input>
          </div>
          <button type="button" onClick={encodeWifi} className="rounded-lg shadow-sm shadow-slate-600 bg-orange-500 text-white text-lg w-32 h-12 mx-auto mt-4">Generate</button>
        </>
      }

{
        encodeType === "Text" &&
        <>
          <div className="my-4 mx-4 flex flex-col md:mx-10">
            <label className="text-emerald-700">Text:</label>
            <input
              type="text"
              onChange={(e) => setTextInput(e.target.value)}
              className="rounded-md border-2 border-orange-400 text-slate-700 text-sm w-full h-9 text-md p-2"
            ></input>
          </div>
          <button type="button" onClick={encodeText} className="rounded-lg shadow-sm shadow-slate-600 bg-orange-500 text-white text-lg w-32 h-12 mx-auto mt-4">Generate</button>
        </>
      }
      </form>
      { response && 
        <img className="w-80 h-80" src={response}/>
      }
    </div>
  );
}

export default App;
