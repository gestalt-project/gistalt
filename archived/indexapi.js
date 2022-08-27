import React, { useState, useEffect } from 'react';
import {
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import OpenAIAPI from "react-openai-api";

export default function TestAPI() {

const [apiKey, setApiKey] = useState("");
  const [promptText, setPromptText] = useState("");

  const [payload, setPayload] = useState({
    prompt: "",
    maxTokens: 25,
    temperature: 0.5,
    n: 1,
  });

  const changeApiKeyHandler = (e) => {
    setApiKey(e.target.value);
  };

  const changePromptHandler = (e) => {
    setPromptText(e.target.value);
  };

  const submitHandler = () => {
    const pl = { ...payload, prompt: promptText };
    setPayload(pl);
  };

  const responseHandler = (openAIResponse) => {
    setPromptText(`${promptText + openAIResponse.choices[0].text}`);
  };

  const handleNavigation = (site) => {
    switch (site) {
      case "github":
        window.open("https://github.com/mhs30/react-openai-api", "_blank");
        break;
      case "twitter":
        window.open("https://twitter.com/marioherrero7", "_blank");
        break;
      case "linkedin":
        window.open(
          "https://www.linkedin.com/in/mario-herrero-siles-2b326212b",
          "_blank"
        );
        break;
    }
  };

  return (
    <Grid container className='lg' spacing={2}>
      <Grid item xs={12}>
        <Container maxWidth="sm">
          <TextField
            label="Api key to test"
            type="password"
            variant="outlined"
            value={apiKey}
            onChange={(e) => changeApiKeyHandler(e)}
          />
          <TextField
            label="Enter text and submit to get a completion"
            multiline
            rows={10}
            value={promptText}
            onChange={(e) => changePromptHandler(e)}
            variant="outlined"
          />
          <Button
            onClick={() => submitHandler()}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </Container>
      </Grid>
      <Grid item xs={12}>
      </Grid>

      {!!apiKey && !!payload.prompt && (
        <OpenAIAPI
          apiKey={apiKey}
          payload={payload}
          responseHandler={responseHandler}
        />
      )}
    </Grid>
  );
};