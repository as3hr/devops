import express from "express";
import mongoose from "mongoose";
import Docker from "dockerode";
import cors from "cors";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({}));

const docker = new Docker({
  socketPath: "/home/asher/.docker/desktop/docker.sock",
});

mongoose.connect("mongodb://localhost:27017/devops-assignment");
mongoose.connection.on('connected', () => console.log('connected'));

interface IContainer {
  _id: string;
  containerId: string;
  userId: string,
  name: string;
  email: string;
  age: number;
  gender: string;
  address: string;
}

const ContainerSchema = new mongoose.Schema<IContainer>({
  name: { type: String },
  email: { type: String,  unique: true },
  age: { type: Number,  min: 18 },
  gender: { type: String },
  address: { type: String },
  containerId: { type: String, default: "" },
});

const Container = mongoose.model<IContainer>("containers", ContainerSchema);

app.post("/form", async (req, res) => {
  const { name, email, age, gender, address } = req.body;
  try {
    const sanitizedName = name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const container = await docker.createContainer({
      Image: "mongo", 
      name: sanitizedName, 
      OpenStdin: true, 
      Tty: true,  
      HostConfig: {
        AutoRemove: false,
      },
    });
    await container.start();
    const userContainer = new Container({ name, email, age, gender, address, containerId: container.id });
    await userContainer.save();
    res.status(201).json({ message: "Form created successfully", data: userContainer.toJSON() });
  } catch (error) {
    res.status(400).json({ message: "Error creating Container", error });
  }
});

app.get("/containers", async (req, res) => {
  try {
    const containers = await Container.find();
    res.json({
      message: "Containers fetched successfully",
      data: containers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching containers", error });
  }
});

app.put("/containers/:id", async (req, res) => {
    const id  = req.params.id;
    const { name, age, gender, address } = req.body;

    const sanitizedName = name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    console.log("Name: ", sanitizedName);
    console.log("ID: ", id);
    const updatedContainer = await Container.findOneAndUpdate(
      { containerId: id },
      { name, age, gender, address },
      { new: true }
    );

    if (!updatedContainer) {
      res.status(404).json({ message: "Container not found in database" });
    }
    
    res.json({ message: "Container renamed and updated successfully", data: updatedContainer });
    
    const container = docker.getContainer(id);
    await container.rename({ name: sanitizedName });
});
  
app.delete("/containers/:id", async (req, res) => {
    const { id } = req.params;
  
    const deletedContainer = await Container.findOneAndDelete({ containerId: id });
    const container = docker.getContainer(id);
    await container.stop();
    await container.remove();

    if (!deletedContainer) {
      res.status(404).json({ message: "Container not found in database" });
    }

    res.json({ message: "Container deleted successfully", container: deletedContainer });
});
  
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});