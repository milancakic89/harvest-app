window.onload = function () {
  let founded = false;
  function time() {
    setTimeout(item => {
      let adress = document.getElementById('barcode');
      if (adress.value.length >= 11 && founded == false) {
        founded = true;
        window.location += `/${adress.value.toUpperCase()}`;
      } else {
        time();
      }
    }, 200)
  }
  time()

}



