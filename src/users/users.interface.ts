import mongoose from "mongoose";

export interface IUser {
  name: string;
  _id: string;
  email: string;
  role: {
    _id: string,
    name: string
  };
  permissions?: {
    _id: string,
    name: string,
    apiPath: string,
    module: string
  }[]
}
