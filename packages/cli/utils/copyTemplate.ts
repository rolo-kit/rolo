import fs from 'fs-extra';

export async function copyTemplate(srcDr: string, targetDr: string) {
  try {
    await fs.copy(srcDr, targetDr);
  } catch (error) {
    throw new Error(`Error while copying ${error}`);
  }
}
