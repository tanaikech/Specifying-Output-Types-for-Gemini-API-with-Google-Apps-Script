# Specifying Output Types for Gemini API with Google Apps Script

This repository is for ["Specifying Output Types for Gemini API with Google Apps Script"](https://medium.com/@tanaike/specifying-output-types-for-gemini-api-with-google-apps-script-c2f6a753c8d7).

![](https://tanaikech.github.io/image-storage/20240410b/fig1.jpg)

# Abstract

The Gemini API generates different outputs depending on the prompts. This report explains how to use function calling in the new Gemini 1.5 API to control the output format (string, number, etc.) within a script during a chat session. This allows for more flexibility in using the Gemini API's results.

# Introduction

The appearance of Gemini has already brought a wave of innovation to various fields. When the Gemini API returns a response, the format of the response is highly dependent on the input text provided as a prompt. For instance, to retrieve the output value as a JSON object, you need to explicitly include a prompt like "Return JSON" within your input. However, there can be situations where the API doesn't return the data in the desired format.

It's crucial to control the output type from the Gemini API. There might be scenarios where you specifically require the output to be in a particular format, such as a string, number, array, or object. Here's where the function calling for the Gemini API comes into play. This functionality allows you to process the output value using a script during a chat session. [Ref](https://medium.com/google-cloud/guide-to-function-calling-with-gemini-and-google-apps-script-0e058d472f45)

In essence, function calling empowers you to control the output type. We've previously explored this concept in reports focusing on specific use cases. [Ref](https://medium.com/google-cloud/categorization-using-gemini-pro-api-with-google-apps-script-804df0101161), [Ref](https://medium.com/google-cloud/flexible-labeling-for-gmail-using-gemini-pro-api-with-google-apps-script-part-2-08015af6b2e6) [Ref](https://medium.com/google-cloud/creating-image-bot-using-gemini-with-google-apps-script-51457cce03d7) [Ref](https://medium.com/google-cloud/attempting-reverse-engineering-with-gemini-api-and-google-apps-script-821b5e63ed79)

This report introduces a general-purpose script that enables control over the output type from the Gemini API. It's important to note that function calling is now supported in the latest Gemini 1.5 API, which is utilized in the script for this report.

# Usage

In order to test this script, please do the following steps.

## 1. Create an API key

Please access [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) and create your API key. At that time, please enable Generative Language API at the API console. This API key is used for this sample script.

This official document can be also seen. [Ref](https://ai.google.dev/).

## 2. Create a Google Apps Script project

In this report, Google Apps Script is used. Of course, the method introducing this report can be also used in other languages.

Please create a standalone Google Apps Script project. Of course, this script can be also used with the container-bound script.

And, please open the script editor of the Google Apps Script project.

## 3. Base script

This is the base script of Class Gemini. This is used with the following sample script.

```javascript
/**
 * Output value by controlling the type.
 */
class Gemini {
  /**
   *
   * @param {String} apiKey API key for Gemini API.
   */
  constructor(apiKey) {
    const model = "models/gemini-1.5-pro-latest"; // or const model = "models/gemini-pro";
    const version = "v1beta";
    this.url = `https://generativelanguage.googleapis.com/${version}/${model}:generateContent?key=${apiKey}`;

    this.functions = {
      params_: {
        customType_string: {
          description:
            "Output type is string type. When the output type is string type, this is used. No descriptions and explanations.",
          parameters: {
            type: "OBJECT",
            properties: {
              items: {
                type: "STRING",
                description:
                  "Output type is string type. When the output type is string type, this is used. No descriptions and explanations.",
              },
            },
            required: ["items"],
          },
        },
        customType_number: {
          description:
            "Output type is number type. When the output type is number type, this is used. No descriptions and explanations.",
          parameters: {
            type: "OBJECT",
            properties: {
              items: {
                type: "NUMBER",
                description:
                  "Output type is number type. When the output type is number type, this is used. No descriptions and explanations.",
              },
            },
            required: ["items"],
          },
        },
        customType_boolean: {
          description:
            "Output type is boolean type. When the output type is boolean type, this is used. No descriptions and explanations.",
          parameters: {
            type: "OBJECT",
            properties: {
              items: {
                type: "BOOLEAN",
                description:
                  "Output type is boolean type. When the output type is boolean type, this is used. No descriptions and explanations.",
              },
            },
            required: ["items"],
          },
        },
        customType_array: {
          description:
            "Output type is array type. When the output type is array type, this is used. No descriptions and explanations.",
          parameters: {
            type: "OBJECT",
            properties: {
              items: {
                type: "ARRAY",
                description:
                  "Output type is array type. When the output type is array type, this is used. No descriptions and explanations.",
              },
            },
            required: ["items"],
          },
        },
        customType_object: {
          description:
            "Output type is JSON object type. When the output type is object type, this is used. No descriptions and explanations.",
          parameters: {
            type: "OBJECT",
            properties: {
              items: {
                type: "OBJECT",
                description:
                  "Output type is JSON object type. When the output type is object type, this is used. No descriptions and explanations.",
              },
            },
            required: ["items"],
          },
        },
      },
      customType_string: (e) => e.items,
      customType_number: (e) => e.items,
      customType_boolean: (e) => e.items,
      customType_array: (e) => e.items,
      customType_object: (e) => e.items,
    };
  }

  /**
   * ### Description
   * Main method.
   *
   * @param {String} q Input text.
   * @returns {(String|Number|Array|Object|Boolean)} Output value.
   */
  run(q) {
    const function_declarations = Object.keys(this.functions).flatMap((k) =>
      k != "params_"
        ? {
            name: k,
            description: this.functions.params_[k].description,
            parameters: this.functions.params_[k]?.parameters,
          }
        : []
    );
    const contents = [{ parts: [{ text: q }], role: "user" }];
    let check = true;
    const results = [];
    let retry = 5;
    do {
      retry--;
      const payload = { contents, tools: [{ function_declarations }] };
      const res = UrlFetchApp.fetch(this.url, {
        payload: JSON.stringify(payload),
        contentType: "application/json",
        muteHttpExceptions: true,
      });
      if (res.getResponseCode() == 500 && retry > 0) {
        console.warn("Retry by the status code 500.");
        this.run(q);
      } else if (res.getResponseCode() != 200) {
        throw new Error(res.getContentText());
      }
      const { candidates } = JSON.parse(res.getContentText());
      if (candidates && !candidates[0]?.content?.parts) {
        results.push(candidates[0]);
        break;
      }
      const parts = (candidates && candidates[0]?.content?.parts) || [];
      check = parts.find((o) => o.hasOwnProperty("functionCall"));
      if (check) {
        contents.push({ parts: parts.slice(), role: "model" });
        const functionName = check.functionCall.name;
        const res2 = this.functions[functionName](
          check.functionCall.args || null
        );
        if (/^customType_.*/.test(functionName)) {
          return res2.items || res2;
        }
        contents.push({
          parts: [
            {
              functionResponse: {
                name: functionName,
                response: { name: functionName, content: res2 },
              },
            },
          ],
          role: "function",
        });
        parts.push({ functionResponse: res2 });
      }
      results.push(...parts);
    } while (check && retry > 0);
    const output = results.pop();
    if (
      !output ||
      (output.finishReason &&
        ["OTHER", "RECITATION"].includes(output.finishReason))
    ) {
      return "No values.";
    }
    return output.text.split("\n").map((e) => e.trim());
  }
}
```

## 4. Sample script 1

```javascript
function sample1() {
  const apiKey = "###"; // Please set your API key.
  const q = "Return one randam word.";

  const res = new Gemini(apiKey).run(q);
  console.log(res);
}
```

When this script is run, the following result is obtained.

```
Hello
```

## 5. Sample script 2

```javascript
function sample2() {
  const apiKey = "###"; // Please set your API key.
  const q = "Return one randam number.";

  const res = new Gemini(apiKey).run(q);
  console.log(res);
}
```

When this script is run, the following result is obtained.

```
2
```

## 6. Sample script 3

```javascript
function sample3() {
  const apiKey = "###"; // Please set your API key.
  const q = "Return 10 randam texts as an array.";

  const res = new Gemini(apiKey).run(q);
  console.log(res);
}
```

When this script is run, the following result is obtained.

```
["text1","text2","text3","text4","text5","text6","text7","text8","text9","text10"]
```

## 7. Sample script 4

```javascript
function sample4() {
  const apiKey = "###"; // Please set your API key.
  const q =
    "Think of 5 random animals and each size (meter), and return the result as JSON data with the format that the key and values are the name of the animal and the size, respectively.";

  const res = new Gemini(apiKey).run(q);
  console.log(res);
}
```

When this script is run, the following result is obtained.

```
{"dog":1,"cat":0.5,"elephant":3,"mouse":0.1,"giraffe":5.5}
```

## 8. Sample script 5

```javascript
function sample5() {
  const apiKey = "###"; // Please set your API key.
  const q =
    "Return the current population of Kyoto, Osaka, Aichi, Fukuoka, Tokyo in Japan as JSON data with the format that the key and values are the prefecture name and the population, respectively.";

  const res = new Gemini(apiKey).run(q);
  console.log(res);
}
```

When this script is run, the following result is obtained.

```
{"Fukuoka":5135214,"Aichi":7552873,"Tokyo":14047594,"Osaka":8837686,"Kyoto":1463723}
```

## 9. Sample script 6

```javascript
function sample6() {
  const apiKey = "###"; // Please set your API key.
  const q =
    "The longest river in the world is the Nile River. Return the result as a boolean.";

  const res = new Gemini(apiKey).run(q);
  console.log(res);
}
```

When this script is run, the following result is obtained.

```
true
```

# Summary

It is considered that the output type can be controlled by the function calling.

# Note

The top image was created by [Gemini](https://gemini.google.com/app).
