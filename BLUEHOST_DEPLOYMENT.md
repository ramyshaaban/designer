# Bluehost Deployment Guide for Space Designer App

## Step 1: Upload Files to Bluehost

1. **Log into your Bluehost cPanel**
2. **Go to File Manager**
3. **Navigate to public_html** (or your domain's folder)
4. **Upload the designer-app.zip file**
5. **Extract the zip file** in your domain folder

## Step 2: Set Up Node.js Application

1. **In cPanel, find "Node.js" or "Node.js Selector"**
2. **Click "Create Application"**
3. **Configure:**
   - **Application Root**: `/public_html/your-domain/designer-app`
   - **Application URL**: `your-domain.com` (or subdomain)
   - **Application Startup File**: `server.js`
   - **Node.js Version**: 18.x or higher

## Step 3: Create server.js File

Create a `server.js` file in your app root:

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
```

## Step 4: Environment Variables

Create `.env.local` file with:

```
NODE_ENV=production
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"
PORT=3000
```

## Step 5: Install Dependencies

In the Node.js application settings:
1. **Click "NPM Install"**
2. **Wait for installation to complete**

## Step 6: Start Application

1. **Click "Start"** in the Node.js application settings
2. **Check the logs** for any errors
3. **Visit your domain** to test the app

## Alternative: Static Export (Simpler)

If Node.js setup is complex, you can create a static version:

1. **Build the app locally**
2. **Export as static files**
3. **Upload to public_html**

## Troubleshooting

- **Check Node.js version** (should be 18+)
- **Verify file permissions**
- **Check application logs**
- **Ensure all dependencies are installed**

## Support

If you need help:
- **Bluehost Support**: 24/7 chat/phone
- **Node.js Documentation**: Bluehost has guides
- **Check cPanel logs** for errors
