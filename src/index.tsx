import React from 'react'
import ReactDOM from 'react-dom'
import { RecoilRoot } from 'recoil'
import './resets.css'
import './base.css'
import './perf/ric-shim'
import App from './App'
import * as serviceWorker from './serviceWorker'

// 🔥 Concurrent mode 🔥
;(ReactDOM as any).unstable_createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RecoilRoot>
      <App websocketEndpoint={process.env.WEBSOCKET_ENDPOINT ?? 'http://localhost:4000'} />
    </RecoilRoot>
  </React.StrictMode>
)

// Standard mode (uncomment this if concurrent mode crashes the app!)
// ReactDOM.render(
//   <React.StrictMode>
//     <RecoilRoot>
//       <App websocketEndpoint={process.env.WEBSOCKET_ENDPOINT ?? "http://localhost:4000"} />
//     </RecoilRoot>
//   </React.StrictMode>,
//   document.getElementById("root")
// );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
