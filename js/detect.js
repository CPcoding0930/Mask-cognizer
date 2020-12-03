const canvas = document.getElementById('detect_result');
const imgResult = document.getElementById('resultImage');

let anchorGenerator = (featureMapSizes, anchorSizes, anchorRatios) => {
    let anchorBBoxes = [];
    featureMapSizes.map((featureSize, idx) =>{
        const cx = tf.div(tf.add(tf.linspace(0, featureSize[0] - 1, featureSize[0]) , 0.5) , featureSize[0]);
        const cy = tf.div(tf.add(tf.linspace(0, featureSize[1] - 1, featureSize[1]) , 0.5) , featureSize[1]);
        const cxGrid = tf.matMul(tf.ones([featureSize[1], 1]), cx.reshape([1,featureSize[0]]));
        const cyGrid = tf.matMul(cy.reshape([featureSize[1], 1]), tf.ones([1, featureSize[0]]));
        const cxGridExpend = tf.expandDims(cxGrid, -1);
        const cyGridExpend = tf.expandDims(cyGrid, -1);
        const center = tf.concat([cxGridExpend, cyGridExpend], -1);
        const numAnchors = anchorSizes[idx].length + anchorRatios[idx].length -1;
        const centerTiled = tf.tile(center, [1, 1, 2*numAnchors]);
        let anchorWidthHeights = [];
        
        for (const scale of anchorSizes[idx]) {
            const ratio = anchorRatios[idx][0];
            const width = scale * Math.sqrt(ratio);
            const height = scale / Math.sqrt(ratio);
            const halfWidth = width /  2;
            const halfHeight = height / 2;
            anchorWidthHeights.push(-halfWidth, -halfHeight, halfWidth, halfHeight);
        }

        for ( const ratio of anchorRatios[idx].slice(1)) {
            const scale = anchorSizes[idx][0];
            const width = scale * Math.sqrt(ratio);
            const height = scale / Math.sqrt(ratio);
            const halfWidth = width /  2;
            const halfHeight = height / 2;
            anchorWidthHeights.push(-halfWidth, -halfHeight, halfWidth, halfHeight);
        }
        const bboxCoord = tf.add(centerTiled , tf.tensor(anchorWidthHeights));
        const bboxCoordReshape = bboxCoord.reshape([-1, 4]);
        anchorBBoxes.push(bboxCoordReshape);
    })
    anchorBBoxes = tf.concat(anchorBBoxes, 0);
    return anchorBBoxes;
}

let detectWebCam = () => {
    detect(webcamElement).then((results) => {
        console.log(results);
        canvas.width = webcamElement.width;
        canvas.height = webcamElement.height;
        console.log(webcamElement.width + " " + webcamElement.height);
        ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(webcamElement, 0, 0, canvas.width, canvas.height );
        for (bboxInfo of results) {
            bbox = bboxInfo[0];
            classID = bboxInfo[1];
            score = bboxInfo[2];

            ctx.beginPath();
            ctx.lineWidth = "3";
            if (classID == 1) {
                ctx.strokeStyle = "red";
                ctx.fillStyle = "red";
            } else {
                ctx.strokeStyle = "green";
                ctx.fillStyle = "green";
            }

            ctx.rect(bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]);
            ctx.stroke();

            ctx.font = "30px Arial";

            if (classID == 1 && freeVoice) {
                VoiceMessage();
            }

            let content = classID + " " + score.toFixed(2);
            ctx.fillText(content, bbox[0], bbox[1] < 20 ? bbox[1] + 30 : bbox[1] - 5);
        }
        var canvasBase64 = canvas.toDataURL();
        imgResult.src = canvasBase64;
    })
    setTimeout(function () {
        detectWebCam();
    }, 300);
}

let decodeBBox = (anchors, rawOutput, variances=[0.1,0.1,0.2,0.2]) => {
    const [anchorXmin, anchorYmin, anchorXmax, anchorYmax] = tf.split(anchors, [1,1,1,1], -1);
    const anchorCX = tf.div(tf.add(anchorXmin, anchorXmax), 2);
    const anchorCY = tf.div(tf.add(anchorYmin, anchorYmax), 2);

    const anchorW = tf.sub(anchorXmax, anchorXmin);
    const anchorH = tf.sub(anchorYmax, anchorYmin);

    const rawOutputScale = tf.mul(rawOutput, tf.tensor(variances));
    const [rawOutputCX, rawOutputCY, rawOutputW, rawOutputH] = tf.split(rawOutputScale, [1,1,1,1], -1);
    const predictCX = tf.add(tf.mul(rawOutputCX, anchorW), anchorCX);
    const predictCY = tf.add(tf.mul(rawOutputCY,anchorH), anchorCY);
    const predictW = tf.mul(tf.exp(rawOutputW), anchorW);
    const predictH = tf.mul(tf.exp(rawOutputH), anchorH);
    const predictXmin = tf.sub(predictCX, tf.div(predictW, 2));
    const predictYmin = tf.sub(predictCY, tf.div(predictH, 2));
    const predictXmax = tf.add(predictCX, tf.div(predictW, 2));
    const predictYmax = tf.add(predictCY, tf.div(predictH, 2));
    const predictBBox = tf.concat([predictYmin, predictXmin, predictYmax, predictXmax],-1);
    return predictBBox
}

let nonMaxSuppression = (bboxes, confidences, confThresh, iouThresh, width, height, maxOutputSize=100) => {
    const bboxMaxFlag = tf.argMax(confidences, -1);
    const bboxConf = tf.max(confidences, -1);
    const keepIndices = tf.image.nonMaxSuppression(bboxes, bboxConf, maxOutputSize, iouThresh, confThresh);
    let results = []
    const keepIndicesData = keepIndices.dataSync();
    const bboxConfData = bboxConf.dataSync();
    const bboxMaxFlagData = bboxMaxFlag.dataSync();
    const bboxesData = bboxes.dataSync();
    keepIndicesData.map((idx) => {
        const xmin = Math.round(Math.max(bboxesData[4*idx + 1] * width, 0));
        const ymin = Math.round(Math.max(bboxesData[4*idx + 0] * height, 0));
        const xmax = Math.round(Math.min(bboxesData[4*idx+3] * width, width))
        const ymax = Math.round(Math.min(bboxesData[4*idx + 2] * height, height));
        results.push([[xmin, ymin, xmax, ymax],
            bboxMaxFlagData[idx], bboxConfData[idx]])
    });
    return results;
}


let loadModel = async () => {
    model = await tf.loadLayersModel('../model/model.json');
    return model;
}

let detect = async (webCamCapture) => {
    const detectedResults = tf.tidy(() => {
        const width = webCamCapture.width;
        const height = webCamCapture.height;
        let image = tf.browser.fromPixels(webCamCapture);
        image = tf.image.resizeBilinear(image, [260, 260]);
        image = image.expandDims(0).toFloat().div(tf.scalar(255));
        const [rawBBoxes, rawConfidences] = model.predict(image);
        const bboxes = decodeBBox(anchors, tf.squeeze(rawBBoxes));
        const results = nonMaxSuppression(bboxes, tf.squeeze(rawConfidences), 0.5, 0.5,  width, height );
        return results;
    })
    return detectedResults;
}

featureMapSizes = [[33, 33], [17, 17], [9, 9], [5, 5], [3,3]];
anchorSizes =  [[0.04, 0.056], [0.08, 0.11], [0.16, 0.22], [0.32, 0.45], [0.64, 0.72]];
anchorRatios = [[1, 0.62, 0.42], [1, 0.62, 0.42], [1, 0.62, 0.42], [1, 0.62, 0.42], [1, 0.62, 0.42]];

let anchors = anchorGenerator(featureMapSizes, anchorSizes, anchorRatios);