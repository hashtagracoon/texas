export default function to(promise) {
   return promise.then(data => {
     console.log("here");
     console.log(data);
      return [null, data];
   })
   .catch(err => [err]);
}
