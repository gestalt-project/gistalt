import axios from 'axios';
import { useState, useEffect } from 'react';

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
    <Grid container className={classes.root} spacing={2}>
      <Grid item xs={12}>
        <Container className={classes.logoContainer} maxWidth="sm">
          <img className={classes.logo} src={reactLogo} alt="React logo" />
          <AddIcon />
          <img className={classes.logo} src={openAILogo} alt="OpenAI logo" />
        </Container>
      </Grid>
      <Grid item xs={12}>
        <Container maxWidth="sm">
          <TextField
            className={classes.textField}
            label="Api key to test"
            type="password"
            variant="outlined"
            value={apiKey}
            onChange={(e) => changeApiKeyHandler(e)}
          />
          <TextField
            className={classes.textField}
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
          <Typography
            className={classes.disclaimer}
            variant="subtitle2"
            component="h2"
          >
            * This website is for demo purposes only, do not share your API key
            with others, the author of this library don't take responsibility of
            website bad usage
          </Typography>
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