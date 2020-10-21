'use strict';
document.addEventListener("DOMContentLoaded", ready)

function ready() {
    document.forms.anagramForm.onsubmit = () => {
        handleAnagram(); return false
    };
    document.querySelector("#anagramForm span").onclick = function() {
        anagramInput.value = ""
        handleResponse(null, document.forms.anagramForm.parentNode)
    }
    document.forms.matchForm.onsubmit = () => {
        handleMatch(); return false
    };
    document.querySelector("#matchForm span").onclick = function() {
        matchInput.value = ""
        handleResponse(null, document.forms.matchForm.parentNode)
    }
    document.forms.morseForm.onsubmit = () => {
        handleMorse(); return false
    };
    document.querySelector("#morseForm span").onclick = function() {
        morseInput.value = ""
        handleResponse(null, document.forms.morseForm.parentNode)
    }
    document.forms.t9Form.onsubmit = () => {
        handleT9(); return false
    };
    document.querySelector("#t9Form span").onclick = function() {
        t9Input.value = ""
        handleResponse(null, document.forms.t9Form.parentNode)
    }
    document.forms.exifUpload.onsubmit = () => {
        handleExifUpload(); return false
    }
    document.querySelector("#exifUpload span").onclick = function() {
        exifUpload.innerHTML = exifUpload.innerHTML
        handleResponse(null, document.forms.exifUpload.parentNode)
    }
    document.querySelectorAll("#categories input[type=checkbox]").forEach(function(value) {
        value.addEventListener('change', e => handleCategoryChange(e))
    })
    document.querySelector("#flagsform span").onclick = function() {
        flagterms.value = ""
        while (toolresults.firstChild) {
            toolresults.removeChild(toolresults.lastChild)
        }
    }
}

function handleExifUpload() {
    let element = document.forms.exifUpload.parentNode;
    let photo = document.getElementById("exifFile").files[0];
    let formData = new FormData();
    formData.append("exifFile", photo);
    axios({
        url: '/exifUpload',
        method: "post",
        data: formData,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
        },
    })
        .then(response => {
            if (!response.data.Success) {
                handleExifResults([], element)
            } else {
                handleExifResults(response.data.Result, element)
            }
        })
        .catch(error => console.log("Error getting exif data: " + error))
}

function handleAnagram() {
    let input = document.forms.anagramForm.elements.anagramInput.value
    let element = document.forms.anagramForm.parentNode;
    axios.get('/anagram?input='+input)
        .then(function(response){
            if (!response.data.Success) {
                handleResponse([], element)
            } else {
                handleResponse(response.data.Result, element)
            }
        })
        .catch(function (error) {
            console.log("Error getting anagram: " + error)
        })
}

function handleMatch() {
    let input = document.forms.matchForm.elements.matchInput.value
    let element = document.forms.matchForm.parentNode;
    axios.get('/match?input='+input)
        .then(function(response){
            if (!response.data.Success) {
                handleResponse([], element)
            } else {
                handleResponse(response.data.Result, element)
            }
        })
        .catch(function (error) {
            console.log("Error getting match: " + error)
        })
}

function handleMorse() {
    let input = document.forms.morseForm.elements.morseInput.value
    let element = document.forms.morseForm.parentNode;
    axios.get('/morse?input='+input)
      .then(function(response){
          if (!response.data.Success) {
              handleResponse([], element)
          } else {
              handleResponse(response.data.Result, element)
          }
      })
      .catch(function (error) {
          console.log("Error getting anagram: " + error)
      })
}

function handleT9() {
    let input = document.forms.t9Form.elements.t9Input.value
    let element = document.forms.t9Form.parentNode;
    axios.get('/t9?input='+input)
      .then(function(response){
          if (!response.data.Success) {
              handleResponse([], element)
          } else {
              handleResponse(response.data.Result, element)
          }
      })
      .catch(function (error) {
          console.log("Error getting T9: " + error)
      })
}


function handleResponse(results, element, maxResults = 1000) {
    let children = [ ...element.children ];
    children.forEach(function(child) {
        if (child.tagName !== "FORM") {
            element.removeChild(child)
        }
    })
    let htmlString = "<ul>"
    if (results === null) {
    } else if (results.length === 0) {
        htmlString += "<li>No Results</li>"
    } else if (results.length > maxResults) {
        htmlString += "<li>Over "+maxResults+" results, please narrow down</li>"
    } else {
        results.forEach(function (result) {
            htmlString += "<li>" + result + "</li>"
        })
    }
    htmlString += "</ul>"
    element.insertAdjacentElement("beforeend", htmlToElement(htmlString))
}

function handleExifResults(results, element) {
    let children = [ ...element.children ];
    children.forEach(function(child) {
        if (child.tagName !== "FORM") {
            element.removeChild(child)
        }
    })
    let htmlString = "<ul>"
    if (results === null) {
    } else if (results.length === 0) {
        htmlString += "<li>No Results</li>"
    } else {
        htmlString += "<li>Size: "+results.width+"x"+results.height+"</a></li>"
        htmlString += "<li>Type: "+results.type+"</li>"
        if (results.exifData.mapLink != null) {
            htmlString += "<li><a href='"+results.exifData.mapLink+"' target='_blank'>Maps link</a></li>"
        }
        if (results.exifData.datetime != null) {
            htmlString += "<li>" + results.exifData.datetime + "</li>"
        }
        if (results.exifData.comments != null) {
            htmlString += "<li>" + results.exifData.comments + "</li>"
        }
        if (results.exifData.rawValues == null) {
            htmlString += "<li>No Exif</li>"
        } else {
            for (const [key, value] of Object.entries(results.exifData.rawValues)) {
                htmlString += "<li>" + key + ": " + value + "</li>"
            }
        }
    }
    htmlString += "</ul>"
    element.insertAdjacentElement("beforeend", htmlToElement(htmlString))
}

function htmlToElement(html) {
    let template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}
