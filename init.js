let request = chrome.webRequest.onBeforeRequest;
let file_names = []

chrome.runtime.getPackageDirectoryEntry((root) => {
    let reader = root.createReader();
    reader.readEntries((results) => {
        searchDir(root, results.filter(x => !['init.js', 'manifest.json', 'README.md', 'LICENSE', '.git'].includes(x.name)));
    });
});

function searchDir(parent, directories) {
    for (let directory of directories) {
        parent.getDirectory(directory.name, { create: false }, (dir) => {
            var reader = dir.createReader();
            //fix to the 100 folder bottelnecking with create reader function
            const read = () => {
                reader.readEntries((results) => {
                    if (results.length > 0) {
                        let newDirs = results.filter(x => x.isDirectory);
                        let files = results.filter(x => x.isFile);
                        if (newDirs.length) searchDir(dir, newDirs);
                        for (let file of files) {
                            request.addListener((details) => {
                                return {
                                    redirectUrl: chrome.extension.getURL(file.fullPath.replace('/crxfs/', ''))
                                }
                            }, {
                                urls: [
                                    '*://*.venge.io/' + file.fullPath.replace('/crxfs/', '') + '*',
                                ]
                            }, ['blocking']);
                        }
                        read()
                    } else {
                    }
                });
            }
            read()
        });
    }
}
//checks all folders
