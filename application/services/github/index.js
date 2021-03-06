const showdown  = require('showdown')
const converter = new showdown.Converter()
converter.setFlavor('github')
const axios = require('axios')

module.exports = async (file, directory, options) => {
    // Check if the file has an extension
    const args = file.split('.')
    if (args < 2 || !args) return console.error('No file extension provided', args)

    // Check if the extension is a string
    const extension = args[args.length - 1].toLowerCase()
    if (typeof extension !== "string") return console.error('Invalid file extension:', args)

    // Create the URI path for the request
    const fileUri = (directory ? `${directory}/${file}` : file)

    console.log('fileURI: ', `https://rawgit.com/blockstreet/content/${options.branch}/${fileUri}`)

    // If file type is JSON
    if (extension === 'json') {
        return {
            type: 'json',
            payload: await axios.get(`https://rawgit.com/blockstreet/content/${options.branch}/${fileUri}`)
        }
    }

    // If file type is Markdown
    if (extension === 'md') {
        let result

        try {
            result = await axios.get({
                uri: `https://rawgit.com/blockstreet/content/${options.branch}/${fileUri}`
            })
        } catch (error) {
            console.log('Failed to retrieve URI: ', error)
        }

        if (options.query.format === 'markdown') {
            return {
                type: 'markdown',
                payload: result
            }

        } else {
            console.log('URI: ', fileUri, result)

            return {
                type: 'html',
                payload: converter.makeHtml(result)
            }
        }
    }

    // Should never get here otherwise invalid input
    return new Error('Invalid input to Github file handler.')
}
