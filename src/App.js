import './App.css';
import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
// atob is deprecated but this function converts base64string to text string
const decodeFileBase64 = (base64String) => {
  // From Bytestream to Percent-encoding to Original string
  return "data:image/png;base64," + base64String
  // decodeURIComponent(
  //   atob(base64String).split("").map(function (c) {
  //     return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
  //   }).join("")
  // );
};


function App() {

  const [inputFileData, setInputFileData] = React.useState(''); // represented as bytes data (string)
  const [outputFileData, setOutputFileData] = React.useState(''); // represented as readable data (text string)
  const [buttonDisable, setButtonDisable] = React.useState(true);
  const [buttonText, setButtonText] = React.useState('Submit');
  // preview input image
  const [selectedDropdownFile, setSelectedDropdownFile] = React.useState('');
  const [buttonDisable_demo, setButtonDisable_demo] = React.useState(true);
  const [submitButtonText, setSubmitButtonText] = React.useState('Submit');
  const [inputFileData_demo, setInputFileData_demo] = React.useState(''); // represented as bytes data (string)
  const [inputImage, setInputImage] = React.useState(''); // represented as bytes data (string)
  const [demoDropdownFiles, setDemoDropdownFiles] = React.useState([]);
  const [outputFileData_demo, setOutputFileData_demo] = React.useState(''); // represented as readable data (text string)
  const [fileButtonText, setFileButtonText] = React.useState('Upload File');

  // convert file to bytes data
  const handleImgError = () =>{
    setInputImage("https://thumbs.dreamstime.com/b/transparent-designer-must-have-fake-background-39672616.jpg")
    setInputFileData_demo("https://thumbs.dreamstime.com/b/transparent-designer-must-have-fake-background-39672616.jpg")
    setOutputFileData_demo("https://thumbs.dreamstime.com/b/transparent-designer-must-have-fake-background-39672616.jpg")
    setOutputFileData("https://thumbs.dreamstime.com/b/transparent-designer-must-have-fake-background-39672616.jpg")
  }

  const convertFileToBytes = (inputFile) => {
    console.log('converting file to bytes...');
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(inputFile); // reads file as bytes data

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  }
  // handle file input
  const handleChange = async (event) => {
    // Clear output text.
    
    setOutputFileData("");

    console.log('newly uploaded file');
    const inputFile = event.target.files[0];
    console.log(inputFile);
    // convert file to bytes data
    const base64Data = await convertFileToBytes(inputFile);
    const base64DataArray = base64Data.split('base64,'); // need to get rid of 'data:image/png;base64,' at the beginning of encoded string
    const encodedString = base64DataArray[1];
    setInputFileData(encodedString);
    console.log('file converted successfully');

    // enable submit button
    setButtonDisable(false);
  };
  // image background

  const myStyle={
//     backgroundImage: 
// //"url('https://media.geeksforgeeks.org/wp-content/uploads/rk.png')"//,
// "url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3xyRmW79jSj2ljzM6NlPr0ExRH9Dcm93Zxg&usqp=CAU",
// // "url('https://wallpapercave.com/dwp2x/fuKCPDK.jpg')"//,

    height:'100vh',
    marginTop:'-60px',
    fontSize:'50px',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
};
// const testA={
//   fontSize:'50px',
//   color:'red',
// };
  // handle file submission
  const handleSubmit = (event) => {
    event.preventDefault();
    
    // temporarily disable submit button
    setButtonDisable(true);
    setButtonText('Loading Result');

    // make POST request
    console.log('making POST request...');
    fetch('https://fz8ls39crb.execute-api.us-east-1.amazonaws.com/prod/', {
      method: 'POST',
      headers: { "Content-Type": "application/json", "Accept": "text/plain" },
      body: JSON.stringify({ "image": inputFileData })
    }).then(response => response.json())
    .then(data => {
      console.log('getting response...')
      console.log(data);
    
      // POST request error
      if (data.statusCode === 400) {
        const outputErrorMessage = JSON.parse(data.errorMessage)['outputResultsData'];
        setOutputFileData(outputErrorMessage);
      }

      // POST request success
      else {
        const outputBytesData = JSON.parse(data.body)['outputResultsData'];
        setOutputFileData(decodeFileBase64(outputBytesData));
      }

      // re-enable submit button
      setButtonDisable(false);
      setButtonText('Submit');
    })
    .then(() => {
      console.log('POST request success');
    })
  }


//--------------------------------- Demo part -----------------------------------//
const DROPDOWN_API_ENDPOINT = 'https://tz5cv9f9pb.execute-api.us-east-1.amazonaws.com/prod'; // TODO
// const ML_API_ENDPOINT = 'https://9xmmdlqzi4.execute-api.us-east-1.amazonaws.com/prod'; // TODO
const ML_API_ENDPOINT = 'https://fz8ls39crb.execute-api.us-east-1.amazonaws.com/prod/'; // TODO

// const decodeFileBase64_demo = (base64String) => {
//   // From Bytestream to Percent-encoding to Original string
//   return decodeURIComponent(
//     atob(base64String).split("").map(function (c) {
//       return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
//     }).join("")
//   );
// };

  // make GET request to get demo files on load -- takes a second to load
  React.useEffect(() => {
    fetch(DROPDOWN_API_ENDPOINT)
    .then(response => response.json())
    .then(data => {
      // GET request error
      if (data.statusCode === 400) {
        console.log('Sorry! There was an error, the demo files are currently unavailable.')
      }

      // GET request success
      else {
        const s3BucketFiles = JSON.parse(data.body);
        setDemoDropdownFiles(s3BucketFiles["s3Files"]);
      }
    });
  }, [])




 // handle demo dropdown file selection
 const handleDropdown = (event) => {
  setSelectedDropdownFile(event.target.value);

  // temporarily disable submit button
  setButtonDisable_demo(true);
  setSubmitButtonText('Loading Demo File...');

  // only make POST request on file selection
  if (event.target.value) {
    fetch(DROPDOWN_API_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({ "fileName": event.target.value })
    }).then(response => response.json())
    .then(data => {

      // POST request error
      if (data.statusCode === 400) {
        console.log('Uh oh! There was an error retrieving the dropdown file from the S3 bucket.')
      }

      // POST request success
      else {
        const dropdownFileBytesData = JSON.parse(data.body)['bytesData'];
        setInputFileData_demo(dropdownFileBytesData);
        setInputImage('data:image/png;base64,' + dropdownFileBytesData); // hacky way of setting image from bytes data - even works on .jpeg lol
        setSubmitButtonText('Submit');
        setButtonDisable_demo(false);
        
    }
    });
  }
  else {
    setInputFileData('');
  }
}


  // handle file submission
  const handleSubmit_demo = (event) => {
    event.preventDefault();

    // temporarily disable submit button
    setButtonDisable(true);
    setSubmitButtonText('Loading Result...');

    // make POST request
    fetch(ML_API_ENDPOINT, {
      method: 'POST',
      headers: { "Content-Type": "application/json", "Accept": "text/plain" },
      body: JSON.stringify({ "image": inputFileData_demo })
    }).then(response => response.json())
    .then(data => {
      // POST request error
      if (data.statusCode === 400) {
        const outputErrorMessage = JSON.parse(data.errorMessage)['outputResultsData'];
        setOutputFileData_demo(outputErrorMessage);
      }

      // POST request success
      else {
        const outputBytesData = JSON.parse(data.body)['outputResultsData'];
        setOutputFileData_demo('data:image/png;base64,' + outputBytesData);
      }

      // re-enable submit button
      setButtonDisable(false);
      setSubmitButtonText('Submit');
    })
  }

//------------------------------------------------//
  const App = () => (
    <div className='app'>
      <Navigation />
      <Main />
     </div>
  );
  const Navigation = () => (
    <nav>
      <ul>
        <li><NavLink exact activeClassName="current" to='/'>Home</NavLink></li>
        <li><NavLink exact activeClassName="current" to='/about'>Demo</NavLink></li>
        <li><NavLink exact activeClassName="current" to='/report'>Report</NavLink></li>

      </ul>
    </nav>
  );
  const Home = () => (
    <div className='home'>
      <div className="Image">
      <img src="https://inst.eecs.berkeley.edu/~cs194-26/sp20/upload/files/projFinalProposed/cs194-26-agr/assets/berkeley_cubist.png" height = "300" />
      <h6>
      {/* <p ><strong> */}
      <br></br>
      <br></br>

      1. Input is expected to be a small size file named content.png in advance
      <br></br>
      <br></br>

      <pr></pr>
      2. Output is a style transfomed image file with size 224*224 pixels 
      {/* </strong></p> */}
      </h6>
      <div class="float-container">

<div class="float-child">
  <div class="green">Input</div>
  <div className="Input" >
    <br></br>
        <form onSubmit={handleSubmit}>
          <label for="file-upload" class="button-6">
         <i class="fa fa-cloud-upload"></i>  Upload Image
          </label>
        <input id="file-upload" type="file" accept=".png"   onChange={handleChange}/>
        <div>
        <button type="Submit" class="button-6"  disabled={buttonDisable}>{buttonText}</button>
        </div>
        </form>
      </div>
  
  </div>

<div class="float-child">
  <div class="blue">Output</div>
  <div className="Output">
        {/* <p>{outputFileData}</p> */}
        
        <img src={outputFileData}  height = "300" width = "400" onError={handleImgError}/>
    
    </div>
</div>

</div>
      
      </div>

     
    </div>
  );

  const Report = () => (
    <div className='report'>
        <object data = "Technical_Report_for_EECS605.pdf"  type="application/pdf" width="1500" height="1000">
  </object>
      </div>
  )
  const About = () => (
    <div className='about'>
<div class="float-container">

<div class="float-child">
  <div class="green"></div>
      <label htmlFor="demo-dropdown">Demo: </label>
        <select name="Select Image" id="demo-dropdown" value={selectedDropdownFile} onChange={handleDropdown}>
            <option value="">-- Select Demo File --</option>
            {demoDropdownFiles.map((file) => <option key={file} value={file}>{file}</option>)}
        </select>
        <img src={inputImage}   height = "300" width = "400" onError={handleImgError}/>

       <form onSubmit={handleSubmit_demo}>
          <label htmlFor="file-upload">{fileButtonText}</label>
          <input type="file" id="file-upload" onChange={handleChange} />
          <button type="submit" disabled={buttonDisable_demo}>{submitButtonText}</button>
        </form>



</div>

<div class="float-child">
  <div class="blue"></div>
<h3>Result</h3>
  <div className="Output">
        <h2><img src={outputFileData_demo} alt=""  height = "300" width = "400" onError={handleImgError} /></h2>


</div>

</div>






      </div>
    </div>
  );
  const Main = () => (
    <Routes>
      <Route exact path='/' element={<Home/>}></Route>
      <Route exact path='/about' element={<About/>}></Route>
      <Route exact path='/report' element={<Report/>}></Route>

    </Routes>
  );
  return (
    
    <div className="App"  style={myStyle}>
      <br></br>
      <div className='app'>
      <h1>Fast style transfer</h1>



   


      </div>
      <Navigation />
      <Main />
      </div>


    

    
  );
  
}

export default App;
