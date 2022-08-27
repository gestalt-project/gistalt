import { useRouter } from 'next/dist/client/router'
import { useCollection } from "react-firebase-hooks/firestore"
import { TextButton } from '../components/Buttons';
import { useState, useEffect } from 'react';
import { Tooltip } from '@mui/material';
import axios from 'axios';

function GenerateImg(props) {
    
  const router = useRouter(),
    db = props.db,
    session = props.session,
    sid = props.sid ? props.sid : null,
    gid = props.gid ? props.gid : null,
    [storiesSnapshot] = useCollection(db.collection('userData').doc(
      session.user.name).collection('stories').orderBy('timestamp', 'desc'))

  const [prompt, setPrompt] = useState('');
  const [URL, setURL] = useState('');
//   const [imgArray, setImgArray] = useState(["https://cdn.vox-cdn.com/thumbor/Xyhm0rh1njtvgfExrnJb_fXERg0=/1400x1400/filters:format(png)/cdn.vox-cdn.com/uploads/chorus_asset/file/23371032/DALL_E_Teddy_bears_mixing_sparkling_chemicals_as_mad_scientists__steampunk.png", "https://cdn.openai.com/dall-e-2/demos/variations/originals/robo_dalle.jpg", "https://content.fortune.com/wp-content/uploads/2022/04/DALL%C2%B7E-a-vintage-photo-of-a-corgi-on-a-beach-2-e1649252071938.png", "https://cdn.openai.com/dall-e-2/demos/text2im/astronaut/horse/photo/9.jpg"]);
  // const emptyArray = ["https://image.pngaaa.com/721/1915721-middle.png", "https://image.pngaaa.com/721/1915721-middle.png", "https://image.pngaaa.com/721/1915721-middle.png", "https://image.pngaaa.com/721/1915721-middle.png"]
  const emptyArray = ["https://cdn.openai.com/dall-e-2/demos/variations/modified/girl_with_pearl_earring/2.jpg", "https://cdn.openai.com/dall-e-2/demos/variations/modified/girl_with_pearl_earring/2.jpg", "https://cdn.openai.com/dall-e-2/demos/variations/modified/girl_with_pearl_earring/2.jpg", "https://cdn.openai.com/dall-e-2/demos/variations/modified/girl_with_pearl_earring/2.jpg"]
  const loadingArray = ["https://media.discordapp.net/attachments/979435099349200938/1000152822467268718/loading_gif.gif", "https://media.discordapp.net/attachments/979435099349200938/1000152822467268718/loading_gif.gif", "https://media.discordapp.net/attachments/979435099349200938/1000152822467268718/loading_gif.gif", "https://media.discordapp.net/attachments/979435099349200938/1000152822467268718/loading_gif.gif"]
  const [imgArray, setImgArray] = useState(emptyArray);
  const [storyText, setStoryText] = useState('');
  const [imgSelect, setImgSelect] = useState('');
  
  useEffect(() => {
    console.log("GenerateImg useEffect")
}, [imgArray]);

  const sendDataToParent = props.sendDataToParent;

  const handleSubmit = async(event) => {
    
    event.preventDefault();

    if (prompt === '') {
      alert("Please Enter a Prompt.");
      return;
    }

    setImgArray(loadingArray)
    const { data } = await axios.post(URL);
    setImgArray(data)
    // setImgArray(emptyArray)
    
    console.log("imgArray is: ", imgArray);
  }
  
  const handleChange = (event) => {
    setPrompt(event.target.value);
    setURL("https://gestalt.loca.lt/getResponse?prompt=" + event.target.value)
    // setURL("http://digital-humans.loca.lt/fetch-db")
    console.log("url is: ", URL);
  }

  const handleImgChange = (event) => {
    setImgSelect(event.target.value)
    sendDataToParent(imgArray[imgSelect]);
  }


  return (
    <div className="component-style">
      <form onSubmit={handleSubmit}>
        <fieldset>
              <div className="flex items-center w-full px-0">
                <input onChange={handleChange} value={prompt} type="search" className=" form-control relative flex-auto min-w-0 block w-full px-3 py-1.5 text-base font-normal text-light-gray bg-base-gray bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-light-gray focus:bg-mid-gray focus:border-blue-600 focus:outline-none" placeholder="Enter prompt" aria-label="Enter prompt" aria-describedby="button-addon3"/>
                <Tooltip title="Generate image">
                <div className="p-3">
                <TextButton onClickFunc={handleSubmit} text="Generate" size='3xl' />
                </div>
                </Tooltip>
          </div>
        </fieldset>
      </form>


      <div className="grid grid-cols-4 gap-4 py-4 flex items-center">
        <label className="mb-4">
          <input type="radio" name="test" value={0} onClick={handleImgChange} readOnly=""/>
          <img src={ imgArray[0] } className="max-w-full h-auto hover:scale-90 transform transition duration-200" alt="" />
        </label>
        <label className="mb-4">
          <input type="radio" name="test" value={1} onClick={handleImgChange} readOnly=""/>
          <img src={ imgArray[1] } className="max-w-full h-auto hover:scale-90 transform transition duration-200" alt="" />
        </label>
        <label className="mb-4">
          <input type="radio" name="test" value={2} onClick={handleImgChange} readOnly=""/>
          <img src={ imgArray[2] } className="max-w-full h-auto hover:scale-90 transform transition duration-200" alt="" />
        </label>
        <label className="mb-4">
          <input type="radio" name="test" value={3} onClick={handleImgChange} readOnly=""/>
          <img src={ imgArray[3] } className="max-w-full h-auto hover:scale-90 transform transition duration-200" alt="" />
        </label>      
      </div>

    </div>
  );
}

export { GenerateImg };