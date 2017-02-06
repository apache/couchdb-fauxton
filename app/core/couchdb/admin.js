import app from './../../app';
import { json } from '../http';

export function create({name, password, node}) {
  return json(`${app.host}/_node/${node}/_config/admins/${name}`, {
    method: "PUT",
    body: JSON.stringify(password)
  });
}
