import {
  removeTemporaryFile,
  saveFileToTmp,
  TFile,
  uploadFile as moveTemporaryFile,
} from "../../utils/file";

export const createFile = async (data: TFile) => {
  return await saveFileToTmp(data);
};

export const createBatchFiles = async (data: TFile[]) => {
  return await Promise.all(data.map((item) => saveFileToTmp(item)));
};

export const uploadFile = async (data: string) => {
  return await moveTemporaryFile(data);
};

export const deleteFile = async (filePath: string) => {
  return removeTemporaryFile(filePath);
};
