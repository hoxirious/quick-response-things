import axios from "axios";
import { Buffer } from 'buffer';
import qs from "qs";
import { useState } from "react";
import "./App.css";
//import cx from "classnames";

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
interface Fieldset {
  id: string;
  name: string;
  value: string;
}

interface ErrorFieldset {
  fieldsetId: string;
  fieldsetName: string;
  errorMessage: string;
}


let WifiInputList: Fieldset[] = [{
  value: "",
  id: "wifi-name",
  name: "Wifi Name",
}, {
  value: "",
  id: "wifi-password",
  name: "Wifi Password",
}]

let TextInputList: Fieldset[] = [{
  value: "",
  id: "text-input",
  name: "Text Input",
}]


function App() {
  const [formSubmitted, updateFormSubmitted] = useState<boolean>(false);
  const [encodeType, setEncodeType] = useState<EncodeType>("Wifi");
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [response, setResponse] = useState("");
  const [wifiInput, setWifiInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");

  async function encodeEverything() {
    const errorMessagess = validateRequiredFieldsets();

    if(errorMessagess.length > 0) {
      return;
    }

    updateFormSubmitted(true);


    const payload = getPayload();

    axios.post(getUrl(), qs.stringify(payload), {
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

  function validateRequiredFieldsets(): string[] {

    let errorMessage: string[] = [];
    if(encodeType === "Wifi") {

      WifiInputList[0].value = wifiInput;
      WifiInputList[1].value = passwordInput;

      WifiInputList.forEach((fieldset) => {
        const error = validateFieldset(fieldset);
        console.log(error);
        if(error) {
          errorMessage.push(error)
        }
      })
    }
    else {
      TextInputList[0].value = textInput;

      TextInputList.forEach((fieldset) => {

        const error = validateFieldset(fieldset);
        
        if(error) {
          errorMessage.push(error)
        }
      })
    }

    setErrorMessages(errorMessage);

    return errorMessage;
  }

  function validateFieldset(fieldset: Fieldset): string | null {

    const errorMessage: string = `The input field "${fieldset.name}" is empty or invalid!\n`

    if(fieldset.value === "") {
      return errorMessage;
    }

    return "";
  }

  function getUrl(): string {
    return encodeType === "Wifi" ? baseURL + WIFI_ENDPOINT : baseURL + TEXT_ENDPOINT;
  }

  function getPayload(): TextPayload | WifiPayload {
    const payload: TextPayload | WifiPayload = encodeType === "Wifi" ? {
      name: wifiInput,
      connection_type: "WPA",
      password: passwordInput
    } : {
      text: textInput
    }
    return payload;
  }

  return (
    <div className="m-auto bg-white flex justify-center items-center h-screen gap-20 flex-col lg:flex-row">
      <form className="w-3/4 bg-slate-100 flex justify-center flex-col rounded-xl shadow-sm shadow-slate-600 py-10 lg:w-1/3">
        <h1 className="text-center text-4xl my-8 uppercase font-semibold text-emerald-700 max-w-2xl px-4 m-auto">
          Quick Response EveryThing
        </h1>

        <div className="my-4 mx-4 flex flex-col md:mx-10">
          <label htmlFor="encode-type" className="text-emerald-700">
            Type of Data to Encode
          </label>

          <select
            name="encode-type"
            className="rounded-md border-2 border-orange-400 bg-white text-slate-700 text-sm w-full h-9 text-md p-2"
            id="encode-type"
            defaultValue={0}
            onChange={(e) => {
              const index: number = Number(e.target.value);
              setEncodeType(ENCODE_TYPE[index]);
              setResponse("");
            }}
          >
            <option value="0">
              Wifi
            </option>
            <option value="1">Text</option>
          </select>
        </div>
        {encodeType === "Wifi" && (
          <>
            <div className="my-4 mx-4 flex flex-col md:mx-10">
              <label className="text-emerald-700">Wifi Name</label>
              <input
                type="text"
                onChange={(e) => setWifiInput(e.target.value)}
                className={"rounded-md border-2 border-orange-400 text-slate-700 text-sm w-full h-9 text-md p-2"}
                id="wifi-name"
              ></input>
            </div>
            <div className="my-4 mx-4 flex flex-col md:mx-10">
              <label className="text-emerald-700">Wifi Password</label>
              <input
                type="text"
                onChange={(e) => setPasswordInput(e.target.value)}
                className="rounded-md border-2 border-orange-400 text-slate-700 text-sm w-full  h-9 text-md p-2"
                id="wifi-password"
              ></input>
            </div>
          </>
        )}

        {encodeType === "Text" && (
          <>
            <div className="my-4 mx-4 flex flex-col md:mx-10">
              <label className="text-emerald-700">Text Input</label>
              <input
                type="text"
                onChange={(e) => setTextInput(e.target.value)}
                className="rounded-md border-2 border-orange-400 text-slate-700 text-sm w-full h-9 text-md p-2"
                id="text-input"
              ></input>
            </div>
          </>
        )}

        { errorMessages.length > 0 &&
          <div className="my-4 mx-4 md:mx-10">
            {errorMessages.map((error, index) => {
              return (
                <p className="text-red-500 mx-auto text-lg" key={index}>
                  {error}
                </p>
              )
            }) }
          </div>
        }
        <button
          type="button"
          onClick={encodeEverything}
          className="rounded-lg shadow-sm shadow-slate-600 bg-orange-500 text-white text-lg w-32 h-12 mx-auto mt-4"
        >
          Generate
        </button>
      </form>
      {response && <img className="w-80 h-80" src={response} />}
    </div>
  );
}

export default App;
