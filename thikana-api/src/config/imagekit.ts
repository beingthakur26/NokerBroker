import ImageKit from "imagekit";

function requiredEnv(name: "IMAGEKIT_PUBLIC_KEY" | "IMAGEKIT_PRIVATE_KEY" | "IMAGEKIT_URL_ENDPOINT") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

const imagekit = new ImageKit({
  publicKey: requiredEnv("IMAGEKIT_PUBLIC_KEY"),
  privateKey: requiredEnv("IMAGEKIT_PRIVATE_KEY"),
  urlEndpoint: requiredEnv("IMAGEKIT_URL_ENDPOINT"),
});

export default imagekit;
