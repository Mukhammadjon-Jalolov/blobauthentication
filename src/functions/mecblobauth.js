const { app } = require('@azure/functions');
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

// Storage credentials (use environment variables in real code)
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = 'wikifiles'; // your container name

app.http('mecblobauth', {
    methods: ['GET'],
    authLevel: 'function', // login enforced via Azure App Authentication
    handler: async (request, context) => {
      const user = request.headers['x-ms-client-principal'];
      
      if (!user) {
        return { status: 401, body: 'Unauthorized. Please log in with Azure AD.' };
      }
  
      const fileName = request.query.get('file') || 'example.pdf';
  
      // Generate SAS link
      const blobService = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new StorageSharedKeyCredential(accountName, accountKey)
      );
  
      const containerClient = blobService.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(fileName);
  
      const expiresOn = new Date(new Date().valueOf() + 3600 * 1000); // 1 hour
      const sasUrl = await blobClient.generateSasUrl({
        permissions: 'r',
        expiresOn,
      });
  
      return {
        status: 200,
        body: JSON.stringify({ downloadUrl: sasUrl }),
        headers: { 'Content-Type': 'application/json' },
      };
    },
});
