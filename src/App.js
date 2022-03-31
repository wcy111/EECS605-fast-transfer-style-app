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

  // convert file to bytes data
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
    backgroundImage: 
//"url('https://media.geeksforgeeks.org/wp-content/uploads/rk.png')"//,
"url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3xyRmW79jSj2ljzM6NlPr0ExRH9Dcm93Zxg&usqp=CAU",
// "url('https://wallpapercave.com/dwp2x/fuKCPDK.jpg')"//,

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
  const App = () => (
    <div className='app'>
      <h1>Portfolio Website</h1>
      <Navigation />
      <Main />
     </div>
  );
  const Navigation = () => (
    <nav>
      <ul>
        <li><NavLink exact activeClassName="current" to='/'>Home</NavLink></li>
        <p>"%20%20%20%20%20"</p>
        <li><NavLink exact activeClassName="current" to='/about'>About</NavLink></li>
      </ul>
    </nav>
  );
  const Home = () => (
    <div className='home'>
      <p> Feel free to browse around and learn more about me.</p>
      <div className="Image">
      <img src="https://picmatix.com/static/index/img/leopard.jpg" height = "250" />
      <img src="https://picmatix.com/static/index/img/catrina-street-art-512.jpg" height = "250" />
      <img src="https://picmatix.com/static/index/img/leopard-street-art.jpg" height = "250" />
      <p fontSize="1"><strong>
      1. Input is expected to be a small size file named content.png in advance
      <br></br>
      <pr></pr>
      2. Output is a style transfomed image file with size 224*224 pixels </strong></p>
      </div>
      {/* ------Input------- */}
      <div className="Input" >
        <h2>Input</h2>
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
      {/* ------Output------- */}
      <div className="Output">
        <h2>Result</h2>
        {/* <p>{outputFileData}</p> */}
        
        <img src={outputFileData} alt=""/>
    
    </div>
    </div>
  );
  const About = () => (
    <div className='about'>
      <h1>About Me</h1>
      <p>Ipsum dolor dolorem consectetur est velit fugiat. Dolorem provident corporis fuga saepe distinctio ipsam? Et quos harum excepturi dolorum molestias?</p>
      <p>Ipsum dolor dolorem consectetur est velit fugiat. Dolorem provident corporis fuga saepe distinctio ipsam? Et quos harum excepturi dolorum molestias?</p>
    
    </div>
  );
  const Main = () => (
    <Routes>
      <Route exact path='/' element={<Home/>}></Route>
      <Route exact path='/about' element={<About/>}></Route>
    </Routes>
  );
  return (
    
    <div className="App"  style={myStyle}>
      <br></br>
      
      <div className='app'>
      <h1>Fast style transfer</h1>
      <Navigation />
      <Main />
      </div>


    

    
  </div>
  );
  
}

export default App;
