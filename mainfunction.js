const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = async function (context, req) {
    const user = req.headers['x-ms-client-principal-name']; // Azure AD user email

    if (!user) {
        context.res = {
            status: 401,
            body: "Unauthorized"
        };
        return;
    }

    const containerName = "mycontainer";
    const blobName = req.query.blob || "test.pdf";

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    try {
        const downloadResponse = await blobClient.download();
        context.res = {
            status: 200,
            body: downloadResponse.readableStreamBody,
            headers: {
                "Content-Type": "application/octet-stream"
            }
        };
    } catch (err) {
        context.res = {
            status: 404,
            body: "Blob not found"
        };
    }
};