import { defaultsDeep } from "lodash";

export const json = (url, opts = {}) => fetch(
  url,
  defaultsDeep(
    {
      credentials: "include",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json"
      }
    },
    opts
  )
).then(res => res.ok ? res.json() : { error: res.statusText });
