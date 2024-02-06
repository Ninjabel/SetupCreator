import app from "./app";
import swaggerDocs from "./utils/swagger";

const PORT = Number(process.env.PORT) || 3000;

if (process.env.NODE_ENV !== "test") {
  swaggerDocs(app, PORT);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
