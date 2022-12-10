import Web3 from "web3";

import { sampleAbi, sampleContractAddress } from "~/data/sampleData.js";

const RPC = "ここにRPC入れる";

export default {
  mixins: [],
  data() {
    return {
      ethMessage: "",
      ethAddress: "",
      ethSignature: "",
      disabled: false,
      rpc: "ここにRPCいれる",
    };
  },

  computed: {},
  async mounted() {},
  methods: {
    async getContract(abi, contractAddress) {
      const web3 = new Web3(new Web3.providers.HttpProvider(RPC));
      const contract = new web3.eth.Contract(abi, contractAddress);
      return contract;
    },
    async getSample() {
      const contract = await this.getContract(
        sampleAbi,
        sampleContractAddress,
        RPC
      );
      if (!contract) {
        console.log("undefined contract");
        return 0;
      }
      const ret = await contract.methods.get().call(function (err, res) {
        if (err) {
          console.log("An error occured", err);
          return;
        }
        console.log("The balance is: ", res);
      });
      return ret;
    },
    async setSample() {
      const user_eth_address = "ここにウォレットアドレス入れる";
      const contract = await this.getContract(
        sampleAbi,
        sampleContractAddress,
        RPC
      );

      const web3 = new Web3(new Web3.providers.HttpProvider(RPC));

      const txData = contract.methods.set().encodeABI();

      let nonce;
      try {
        nonce = await web3.eth.getTransactionCount(user_eth_address);
      } catch (e) {
        console.log("e : " + e);
      }

      const estimateGas = await web3.eth.estimateGas({
        from: user_eth_address,
        nonce: nonce.toString(),
        to: sampleContractAddress,
        data: txData,
      });
      const gasPrice = await web3.eth.getGasPrice();

      const txParams = {
        from: user_eth_address,
        to: sampleContractAddress,
        gasPrice: gasPrice.toString(),
        gas: estimateGas.toString(),
        nonce: nonce.toString(),
        data: txData,
      };

      const PRIVATE_KEY = "ここにウォレットのプライベートキー入れる";

      const signedTx = await web3.eth.accounts.signTransaction(
        txParams,
        PRIVATE_KEY
      );

      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (error, hash) {
          if (!error) {
            console.log(
              "🎉 The hash of your transaction is: ",
              hash,
              "\n Check Alchemy's Mempool to view the status of your transaction!"
            );
          } else {
            console.log(
              "❗Something went wrong while submitting your transaction:",
              error
            );
          }
        }
      );
    },
  },
};

