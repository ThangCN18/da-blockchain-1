import Web3 from "web3";
export default getWeb3 = async () => {
  new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      if (window.entherum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
};
