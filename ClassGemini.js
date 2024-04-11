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
