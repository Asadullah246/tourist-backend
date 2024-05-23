const express = require("express");
const cors = require("cors");
const SSLCommerzPayment = require("sslcommerz-lts");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const uri =
 "mongodb+srv://traveleaf23:mxH6DZRI2diKGLxf@cluster0.3apb2ni.mongodb.net/?retryWrites=true&w=majority"

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const paymentUrl = "http://localhost:5000";

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASS;
const is_live = false;

async function run() {
  try {


    const db = client.db("travel");
    const newsCollection = db.collection("news");
    const toursCollection = db.collection("tours");
    const destinationCollection = db.collection("destinations");
    const userCollection = db.collection("users");
    const infoCollection = db.collection("info");
    const contactCollection = db.collection("contact");
    const reviewCollection = db.collection("review");
    const orderCollection = db.collection("orders");
    const packageCollection = db.collection("packages");

    // package manage
    app.post("/packages", async (req, res) => {
      const body = req.body;
      const newContact = await packageCollection.insertOne(body);
      res.send(newContact);
    });

    app.get("/packages", async (req, res) => {
      const result = await packageCollection.find({}).toArray();
      res.send(result);
    });

    app.delete("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await packageCollection.deleteOne(query);
      res.send(result); 
    });


    // order manage
    app.post("/order", async (req, res) => {
      const body = req.body;
      const unId = new ObjectId().toString();

      const data = {
        ...body,
        total_amount: body?.totalAmount,
        currency: "BDT",
        tran_id: unId, // use unique tran_id for each api call
        success_url: `${paymentUrl}/payment/success/${unId}`,
        // fail_url: 'http://localhost:3030/fail',
        // cancel_url: 'http://localhost:3030/cancel',
        ipn_url: "http://localhost:3000/ipn",
        shipping_method: "Courier",
        product_name: "Computer.",
        product_category: "Electronic",
        product_profile: "general",
        cus_name: "Customer Name",
        cus_email: "customer@example.com",
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: "01711111111",
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };

      const newOrder = await orderCollection.insertOne({
        ...body,
        unId: unId
      });

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
        // Redirect the user to payment gatewayuserCollectionorder
        let GatewayPageURL = apiResponse.GatewayPageURL;

        res.send({ url: GatewayPageURL });
        console.log("Redirecting to: ", GatewayPageURL);
      });

    });


    app.post("/payment/success/:unId", async (req, res) => {
      const id = req.params.unId;
      console.log("id", id);

      // res.send(newBlog);
      res.redirect(`http://localhost:3000/success/${id}`);
    });


    app.get("/order", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.send(result);
    });


    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { unId: id };
      const result = await orderCollection.findOne(query);
      res.send(result);
    });

    app.put("/order/:id", async (req, res) => {
      const body = req.body;
      const id=req.params.id ;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedData = {
        $set: body,
      };
      const infoUpdate = await orderCollection.updateOne(
        query,
        updatedData,
        options
      );
      res.send(infoUpdate);
    });


    // app.patch("/order/:id", async (req, res) => {
    //   const body = req.body;
    //   const id = req.params.id;
    //   console.log("b", body);
    //   const query = { _id: new ObjectId(id) };
    //   const updatedData = {
    //     $set: body,
    //   };
    //   const newBlog = await orderCollection.updateOne(query, updatedData);
    //   res.send(newBlog);
    // });

    // app.delete("/order/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await orderCollection.deleteOne(query);
    //   res.send(result);
    // });
    // order manage

    // review manage
    app.post("/review", async (req, res) => {
      const body = req.body;
      const newContact = await reviewCollection.insertOne(body);
      res.send(newContact);
    });

    app.get("/review", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.send(result);
    });
    // review manage

    // contact manage

    app.post("/contact", async (req, res) => {
      const body = req.body;
      const newContact = await contactCollection.insertOne(body);
      res.send(newContact);
    });

    app.get("/contact", async (req, res) => {
      const result = await contactCollection.find({}).toArray();
      res.send(result);
    });

    // contact manage

    // info manage

    app.get("/info", async (req, res) => {
      const result = await infoCollection.find({}).toArray();
      res.send(result);
    });

    app.put("/info/", async (req, res) => {
      const body = req.body;
      const query = {};
      const options = { upsert: true };
      const updatedData = {
        $set: body,
      };
      const infoUpdate = await infoCollection.updateOne(
        query,
        updatedData,
        options
      );
      res.send(infoUpdate);
    });
    // info manage

     // upload destination
     app.post("/destination", async (req, res) => {
      const body = req.body;
      const newTour = await destinationCollection.insertOne(body);
      res.send(newTour);
    });
    // get destination
    app.get("/destination", async (req, res) => {
      const result = await destinationCollection.find({}).toArray();
      res.send(result);
    });

    app.get("/destination/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await destinationCollection.findOne(query);
      res.send(result);
    });

    // delete destination
    app.delete("/destination/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await destinationCollection.deleteOne(query);
      res.send(result);
    });




    // upload tour
    app.post("/tour", async (req, res) => {
      const body = req.body;
      const newTour = await toursCollection.insertOne(body);
      res.send(newTour);
    });
    // get tours
    app.get("/tour", async (req, res) => {
      const result = await toursCollection.find({}).toArray();
      res.send(result);
    });

    //get single tour

    app.get("/tour/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toursCollection.findOne(query);
      res.send(result);
    });

    // delete tour
    app.delete("/tour/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toursCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/tour/comment/:id", async (req, res) => {
      const body = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updatedData = {
        $push: { comments: body },
      };
      const newCom = await toursCollection.updateOne(
        query,
        updatedData,
        options
      );
      res.send(newCom);
    });


// get news
app.get("/news", async (req, res) => {
    const result = await newsCollection.find({}).toArray();
    res.send(result);
  });

   // upload news
   app.post("/news", async (req, res) => {
    const body = req.body;
    const newNews = await newsCollection.insertOne(body);
    res.send(newNews);
  });

// delete news
app.delete("/news/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await newsCollection.deleteOne(query);
  res.send(result);
});

// manage comments
app.put("/news/comment/:id", async (req, res) => {
  const body = req.body;
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const options = { upsert: true };

  const updatedData = {
    $push: { comments: body },
  };
  const newCom = await newsCollection.updateOne(
    query,
    updatedData,
    options
  );
  res.send(newCom);
});


// user  manage

app.get("/user", async (req, res) => {
  const result = await userCollection.find({}).toArray();
  res.send(result);
});

 // upload news
 app.post("/user/create-account", async (req, res) => {
  const body = req.body;
  const newuser = await userCollection.insertOne(body);
  res.send(newuser);
});

// delete news
app.delete("/user/:id", async (req, res) => {
const id = req.params.id;
const query = { _id: new ObjectId(id) };
const result = await userCollection.deleteOne(query);
res.send(result);
});



    await client.db("admin").command({ ping: 1 });
    console.log("successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Travel server is Running");
});

app.listen(port, () => {
  console.log(`Travel server running on port: ${port}`);
});
