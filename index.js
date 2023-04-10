import { readFileSync, writeFileSync } from "fs";
import weaviate from "weaviate-ts-client";

const main = async () => {
  const client = weaviate.client({
    scheme: "http",
    host: "localhost:8080",
  });

  // Define schema
  const schemaConfig = {
    class: "MemeObject",
    vectorizer: "img2vec-neural",
    vectorIndexType: "hnsw",
    moduleConfig: {
      "img2vec-neural": {
        imageFields: ["image"],
      },
    },
    properties: [
      {
        name: "image",
        dataType: ["blob"],
      },
      {
        name: "text",
        dataType: ["string"],
      },
    ],
  };

  // Create schema class
  await client.schema.classCreator().withClass(schemaConfig).do();

  // Create data object
  const img = readFileSync("./assets/img2.jpg");
  const b64 = Buffer.from(img).toString("base64");
  await client.data
    .creator()
    .withClassName("MemeObject")
    .withProperties({
      image: b64,
      text: "toyStory meme",
    })
    .do();

  // Query for similar images
  const test = Buffer.from(readFileSync("./assets/img4.jpg")).toString(
    "base64"
  );
  const resImage = await client.graphql
    .get()
    .withClassName("MemeObject")
    .withFields(["image"])
    .withNearImage({ image: test })
    .withLimit(1)
    .do();

  // Write result to filesystem
  const result = resImage.data.Get.MemeObject[0].image;
  writeFileSync("./result.jpg", result, "base64");
};

main();
