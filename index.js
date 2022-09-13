// importing modules
const express = require("express");
const http = require("http");
const dotenv = require('dotenv');

dotenv.config()
const stripe = require('stripe')("sk_test_51JrmbwAVsqeK8xRi5FXzgZmDC2yxZuY6WtCE7M30nWV8ZVSweUDANe5ImcdY6B9kJuhBdr5a1OJoFq6n90ljybd500ed2rl8Ma");

const app = express();
const port = process.env.PORT || 3000;
var server = http.createServer(app);
// var io = require("socket.io")(server); 

// middle ware
app.use(express.json());

app.get('/', (req, res)=>{
  console.log('hello')
  res.send('hello')

})

app.post('/stripe_payment', async(req, res)=>{
  try {
    let customerId;

    const customerList = await  stripe.customers.list({
      email: req.body.email,
      limit : 1
    })

    if (customerList.data.length !== 0) {
      customerId = customerList.data[0].id;
    }else{
      const customer  = await stripe.customers.create({
        email: req.body.email
      })
      customerId = customer.data.id;
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId},
      { apiVersion: '2020-08-27'}
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(req.body.amount),
      currency: 'usd',
      customer : customerId
    })

    res.status(200).send({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customerId,
      success: true
    })


  } catch (error) {
    res.status(404).send({success: false, error: error.message})
  }
})
















// let activeUsers = [];

// io.on("connection", (socket) =>{
//       socket.on("connect-user", ({name, newUserId}) => {
//     // if user is not added previously
//     if (!activeUsers.some((user) => user.userId === newUserId)) {
//       activeUsers.push({name:name, userId: newUserId, socketId: socket.id });
//       console.log("New User Connected", activeUsers);
//     }

//     // send all active users to new user
//     io.emit("get-users", activeUsers);
//   });

//   socket.on("disconnect", () => {
//     // remove user from active users
//     activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
//     console.log("User Disconnected", activeUsers);
//     // send all active users to all users
//     io.emit("get-users", activeUsers);
//   });

//   // send message to a specific user
//   socket.on("send-message", (data) => {
//     const { receiverId } = data;

//     const user = activeUsers.find((user) => user.userId === receiverId);
    
//     console.log("Sending from socket to :", receiverId)
//     io.emit('sent-to-all-user', data)
//     if (user) {
//       io.to(user.socketId).emit("recieve-message", data);
//     }
//   });



// });



server.listen(port, "0.0.0.0", () => {
  console.log(`Server started and running on port ${port}`);
});
