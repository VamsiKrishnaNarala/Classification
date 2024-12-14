// Handle file upload and data parsing
document.getElementById("file-upload").addEventListener("change", async function (event) {
  const file = event.target.files[0];
  if (file) {
    const text = await file.text();
    const data = parseCSV(text);
    console.log("Parsed Data:", data);
    window.uploadedData = data; // Store data globally for reuse
    // Identify independent and dependent features
    // Enable "Show Data" button
    document.getElementById("show-data-btn").style.display = "inline-block";
  } else {
    alert("Please upload a valid CSV file.");
  }
});

// Preprocess Button Event
document.getElementById("preprocess-btn").addEventListener("click", function () {
  if (!window.uploadedData) {
    alert("Please upload a data file first.");
    return;
  }

  document.getElementById("check-missing-values-btn").classList.remove("hidden");
});


// Check Missing Values
document.getElementById("check-missing-values-btn").addEventListener("click", function () {
  if (!window.uploadedData) {
    alert("Please upload a data file first.");
    return;
  }

  const missingValues = checkForMissingValues(window.uploadedData);

  if (missingValues.length > 0) {
    displayMissingValues(missingValues);
    document.getElementById("handle-missing-values-btn").classList.remove("hidden");
  } else {
    alert("No missing values found!");
    document.getElementById("handle-missing-values-btn").classList.add("hidden");
  }
});

// Handle Missing Values
document.getElementById("handle-missing-values-btn").addEventListener("click", function () {
  if (!window.uploadedData) {
    alert("Please upload a data file first.");
    return;
  }

  const updatedData = handleMissingValues(window.uploadedData);
  window.uploadedData = updatedData;

  alert("Missing values have been handled!");
  splitAndDisplayData(updatedData);
});

// Function to check for missing values
function checkForMissingValues(data) {
  const rowsWithMissing = [];
  data.forEach((row, rowIndex) => {
    const missing = row.some((value) => value === null || value === "" || value === undefined);
    if (missing) rowsWithMissing.push({ rowIndex, row });
  });
  return rowsWithMissing;
}

// Function to display missing values in the console
function displayMissingValues(data) {
  console.log("Missing Values in the Data:");
  data.forEach((row, rowIndex) => {
    if (Array.isArray(row)) {
      // Only iterate over the row if it is an array
      row.forEach((value, colIndex) => {
        if (value === null) {
          console.log(`Missing value found at Row: ${rowIndex + 1}, Column: ${colIndex + 1}`);
        }
      });
    } else {
      // Handle unexpected data formats
      console.warn(`Unexpected value in row ${rowIndex}:`, row);
    }
  });
}


// Function to handle missing values
function handleMissingValues(data) {
  const columns = data[0].length;
  const filledData = JSON.parse(JSON.stringify(data)); // Deep copy of the data

  for (let col = 0; col < columns; col++) {
    const columnData = data
      .map((row) => row[col])
      .filter((val) => val !== null && val !== "" && val !== undefined);

    if (columnData.length === 0) continue; // Avoid empty columns

    const isNumeric = columnData.every((val) => typeof val === "number");

    // Calculate fill value: mean for numeric, mode for non-numeric
    const fillValue = isNumeric
      ? columnData.reduce((sum, num) => sum + num, 0) / columnData.length // Mean
      : calculateMode(columnData); // Mode for strings

    // Replace missing values with the fill value
    filledData.forEach((row) => {
      if (row[col] === null || row[col] === "" || row[col] === undefined) {
        row[col] = fillValue;
      }
    });
  }

  return filledData;
}

// Function to calculate mode of an array
function calculateMode(array) {
  const frequency = {};
  array.forEach((item) => (frequency[item] = (frequency[item] || 0) + 1));
  return Object.keys(frequency).reduce((a, b) => (frequency[a] > frequency[b] ? a : b));
}

// Function to split and display data
function splitAndDisplayData(data) {
  const trainData = data.slice(0, Math.floor(data.length * 0.8));
  const testData = data.slice(Math.floor(data.length * 0.8));

  document.getElementById("results").textContent = "Data split into training and testing sets.";
  displayData(trainData, "Training Data");
  displayData(testData, "Testing Data");
}

// Function to display data in table format
function displayData(data, title) {
  const tableContainer = document.getElementById("data-table");
  tableContainer.innerHTML = `<h3>${title}</h3>`;

  const table = document.createElement("table");
  table.classList.add("mdc-data-table");

  data.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.textContent = cell !== null ? cell : "N/A"; // Display N/A for missing values
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  tableContainer.appendChild(table);
  tableContainer.classList.remove("hidden");
}

// Function to parse CSV data into an array of arrays
function parseCSV(text) {
  const rows = text.trim().split("\n");
  const data = rows.map((row) =>
    row.split(",").map((val) => {
      const cleanedVal = val.trim(); // Remove leading/trailing whitespace

      // Check for missing value patterns: null, "", whitespace-only, undefined, or NaN
      if (
        cleanedVal.toLowerCase() === "null" ||
        cleanedVal === "" ||
        cleanedVal.toLowerCase() === "undefined" ||
        cleanedVal.toLowerCase() === "nan"
      ) {
        return null; // Standardize missing values to null
      }

      // Try parsing as a number
      const parsedNumber = Number(cleanedVal);
      return isNaN(parsedNumber) ? cleanedVal : parsedNumber;
    })
  );
  return data;
}

// Function to display the uploaded data in a table format
function displayData(data) {
  const tableContainer = document.getElementById("data-table");
  tableContainer.innerHTML = ""; // Clear previous data if any

  const table = document.createElement("table");
  table.classList.add("mdc-data-table");

  
  // Create table header
  const header = document.createElement("thead");
  const headerRow = document.createElement("tr");
  data[0].forEach((headerItem) => {
    const th = document.createElement("th");
    th.textContent = headerItem;
    headerRow.appendChild(th);
  });
  header.appendChild(headerRow);
  table.appendChild(header);

  // Create table body
  const tbody = document.createElement("tbody");
  data.slice(1).forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  // Append table to container
  tableContainer.appendChild(table);
  tableContainer.style.display = "block"; // Show the table
}

// Show Data Button Click Handler
document.getElementById("show-data-btn").addEventListener("click", function () {
  if (window.uploadedData) {
    displayData(window.uploadedData); // Display the uploaded data in a table
  } else {
    alert("No data uploaded.");
  }
});

// // Preprocess Button Click Handler
// document.getElementById("preprocess-btn").addEventListener("click", function () {
//   if (!window.uploadedData) {
//     alert("Please upload a data file first.");
//     return;
//   }

//   let data = window.uploadedData;

//   // Check for null values and fill them (mean strategy for numeric, mode for categorical)
//   const headers = data[0];
//   const rows = data.slice(1);

//   const filledData = rows.map((row) => {
//     return row.map((value, index) => {
//       if (value === "" || value === null || value === undefined) {
//         const column = rows.map((r) => r[index]).filter((v) => v !== "" && v !== null && v !== undefined);
//         if (typeof column[0] === "number") {
//           return column.reduce((a, b) => a + b, 0) / column.length; // Mean for numeric
//         } else {
//           return column.sort((a, b) =>
//             column.filter(v => v === a).length - column.filter(v => v === b).length
//           ).pop(); // Mode for categorical
//         }
//       }
//       return value;
//     });
//   });

//   data = [headers, ...filledData];

//   // Function to shuffle rows in the dataset
// function shuffleRows(data) {
//   const headers = data[0]; // Keep the headers separate
//   const rows = data.slice(1); // Extract rows excluding headers

//   for (let i = rows.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [rows[i], rows[j]] = [rows[j], rows[i]];
//   }

//   return [headers, ...rows]; // Combine headers with shuffled rows
// }

//   // Print shape of the dataset
//   const shapeMessage = `Dataset Shape: ${data.length - 1} rows, ${headers.length} columns`;
//   console.log(shapeMessage);
//   document.getElementById("results").textContent = shapeMessage;

//   // Update global data with processed data
//   window.uploadedData = data;
// });

// Handle Classification Button Click
document.getElementById("classification-btn").addEventListener("click", async function () {
  if (!window.uploadedData) {
    alert("Please preprocess the data first.");
    return;
  }

  // Show epoch input field
  document.getElementById("epoch-input-container").style.display = "block";
});

// Handle Confirm Epochs Button Click
document.getElementById("confirm-epochs-btn").addEventListener("click", async function () {
  const epochs = parseInt(document.getElementById("epochs").value);
  if (isNaN(epochs) || epochs <= 0) {
    alert("Please enter a valid number of epochs.");
    return;
  }

  // Show action buttons after entering epochs
  document.getElementById("action-buttons").style.display = "block";
  window.epochs = epochs;
});

// Show Training Data
document.getElementById("show-training-data-btn").addEventListener("click", function () {
  if (window.uploadedData) {
    const trainData = window.uploadedData.slice(1, Math.floor(0.8 * window.uploadedData.length)); // 80% Training Data
    displayData(trainData); // Show Training Data
  } else {
    alert("No data uploaded.");
  }
});

// Show Testing Data
document.getElementById("show-testing-data-btn").addEventListener("click", function () {
  if (window.uploadedData) {
    const testData = window.uploadedData.slice(Math.floor(0.8 * window.uploadedData.length)); // 20% Testing Data
    displayData(testData); // Show Testing Data
  } else {
    alert("No data uploaded.");
  }
});

// Train Model
document.getElementById("train-model-btn").addEventListener("click", async function () {
  const epochs = window.epochs;
  if (!epochs) {
    alert("Please enter the number of epochs first.");
    return;
  }

  try {
    const data = window.uploadedData;

    // Assuming first row contains headers (if available)
    const headers = data[0];
    const independentFeatures = headers.slice(1, -1); // Exclude 'Id' column and dependent feature (last column)
    const dependentFeature = headers[headers.length - 1]; // Dependent feature (class label)

    console.log("Independent Features:", independentFeatures);
    console.log("Dependent Feature:", dependentFeature);

    // Ensure labels are correctly encoded as integers
    const labelEncoder = new Map();
    const ys = data.slice(1).map((row) => row[row.length - 1]); // Dependent labels
    const uniqueLabels = Array.from(new Set(ys)); // Get unique labels
    uniqueLabels.forEach((label, index) => {
      labelEncoder.set(label, index); // Assign each label a unique integer
    });
    const ysEncoded = ys.map((label) => labelEncoder.get(label)); // Encode labels to integers

    const xs = data.slice(1).map((row) => row.slice(1, -1)); // Independent features (excluding 'Id')

    // 80% Training and 20% Testing Split
    const trainSize = Math.floor(0.8 * xs.length);
    const xsTrain = xs.slice(0, trainSize);
    const ysTrain = ysEncoded.slice(0, trainSize);
    const xsTest = xs.slice(trainSize);
    const ysTest = ysEncoded.slice(trainSize);

    // Normalize the data using Min-Max Scaling (based on training set)
    const xsTensor = tf.tensor2d(xsTrain);
    const min = xsTensor.min(0);
    const max = xsTensor.max(0);
    xsTensor.dispose();
        const normalize = (data) =>
      tf.tensor2d(data).sub(min).div(max.sub(min));

    const xsTrainTensor = normalize(xsTrain);
    const xsTestTensor = normalize(xsTest);
    const ysTrainTensor = tf.tensor1d(ysTrain, "int32").cast("float32");
    const ysTestTensor = tf.tensor1d(ysTest, "int32").cast("float32");

    // Define a more complex model to allow for better learning
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: "relu", inputShape: [xs[0].length] }));
    model.add(tf.layers.dense({ units: 32, activation: "relu" }));
    model.add(tf.layers.dense({ units: 16, activation: "relu" }));
    model.add(tf.layers.dense({ units: uniqueLabels.length, activation: "softmax" })); // Softmax for multi-class classification

    // Compile the model with loss and optimizer
    model.compile({ optimizer: "adam", loss: "sparseCategoricalCrossentropy", metrics: ["accuracy"] });

    // Train the model
    const history = await model.fit(xsTrainTensor, ysTrainTensor, { epochs: epochs, batchSize: 32 });

    // Get the training accuracy
    const trainingAccuracy = history.history.acc[history.history.acc.length - 1];
    console.log(`Training Accuracy: ${trainingAccuracy}`);

    // Evaluate the model on test data
    const evalResults = await model.evaluate(xsTestTensor, ysTestTensor);
    const testLoss = evalResults[0].dataSync()[0];
    const testAccuracy = evalResults[1].dataSync()[0];

    console.log(`Test Loss: ${testLoss}`);
    console.log(`Test Accuracy: ${testAccuracy}`);

    // Display results
    
    document.getElementById("results").textContent = `Training Accuracy: ${trainingAccuracy.toFixed(4)}\nTest Accuracy: ${testAccuracy.toFixed(4)}\nTest Loss: ${testLoss.toFixed(4)}`;

    // Enable save model button
    const saveModelBtn = document.getElementById("save-model-btn");
    saveModelBtn.style.display = "inline-block";

    saveModelBtn.addEventListener("click", async function () {
      // Save model to the browser as an .h5 file (TensorFlow format)
      await model.save("downloads://my_model.h5");
      alert("Model saved as .h5 file.");
    });

    // Predict on the test data
    const predictions = model.predict(xsTestTensor).argMax(-1).dataSync();
    const errors = [];

    // Compare predictions to actual labels and find errors
    ysTest.forEach((label, index) => {
      if (predictions[index] !== label) {
        errors.push({
          actual: uniqueLabels[label],
          predicted: uniqueLabels[predictions[index]],
          index: index + 1 // Display row number for errors
        });
      }
    });

    // Show Errors Button
    const showErrorsBtn = document.getElementById("show-errors-btn");
    showErrorsBtn.style.display = "inline-block";

    // Handle Show Errors Button Click - Directly print errors to results section
    showErrorsBtn.addEventListener("click", function () {
      if (errors.length > 0) {
        let errorMsg = "Prediction Errors:\n\n";
        errors.forEach((error) => {
          errorMsg += `Row: ${error.index}, Actual: ${error.actual}, Predicted: ${error.predicted}\n`;
        });
        // Instead of alerting, print the errors to the results section
        document.getElementById("results").textContent = errorMsg;
      } else {
        document.getElementById("results").textContent = "No prediction errors found.";
      }
    });

  } catch (error) {
    console.error("Error during classification:", error);
    document.getElementById("results").textContent = `Error: ${error.message}`;
  }
});


