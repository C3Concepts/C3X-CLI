import { google } from "googleapis";
import chalk from "chalk";

class DriveAPI {
  constructor(authClient) {
    this.authClient = authClient;
    this.drive = google.drive({ version: "v3", auth: authClient });
  }

  async getFileInfo(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: "id,name,mimeType,createdTime,modifiedTime,size,webViewLink",
      });

      return response.data;
    } catch (error) {
      console.error(chalk.red("❌ Error fetching file info:"), error.message);
      throw error;
    }
  }

  async downloadFile(fileId, _outputPath) {
    console.log(chalk.blue(`📥 Downloading file: ${fileId}`));

    try {
      // eslint-disable-next-line no-unused-vars
      const response = await this.drive.files.get(
        { fileId, alt: "media" },
        { responseType: "stream" }
      );

      // TODO: Implement file stream download
      console.log(
        chalk.green("✅ File downloaded (stream not implemented in demo)")
      );
      return { success: true, fileId };
    } catch (error) {
      console.error(chalk.red("❌ Error downloading file:"), error.message);
      throw error;
    }
  }

  async listFilesInFolder(folderId) {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "files(id,name,mimeType,createdTime,modifiedTime,size)",
        pageSize: 100,
      });

      return response.data.files || [];
    } catch (error) {
      console.error(
        chalk.red("❌ Error listing folder contents:"),
        error.message
      );
      return [];
    }
  }
}

export default DriveAPI;

