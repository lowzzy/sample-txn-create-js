async getContract(abi, contractAddress) {
      const web3 = new Web3(new Web3.providers.HttpProvider(this.rpc));
      const contract = new web3.eth.Contract(abi, contractAddress);
      return contract;
    },
    async getERC20Amount(abi, contractAddress, user) {
      if (!user.eth_address) {
        return 0;
      }
      const contract = await this.getContract(abi, contractAddress, this.rpc);
      if (!contract) {
        console.log("undefined contract");
        return 0;
      }
      const ret = await contract.methods
        .balanceOf(user.eth_address)
        .call(function (err, res) {
          if (err) {
            console.log("An error occured", err);
            return;
          }
          console.log("The balance is: ", res);
        });
      return ret;
    },
    async approveErc20(contractAddress, toContractAddress, user, abi, amount) {
      const contract = await this.getContract(abi, contractAddress, this.rpc);

      const web3 = new Web3(new Web3.providers.HttpProvider(this.rpc));

      const txData = contract.methods
        .approve(toContractAddress, amount.toString())
        .encodeABI();

      console.log("user eth address : " + user.eth_address);
      let nonce;
      try {
        nonce = await web3.eth.getTransactionCount(user.eth_address);
      } catch (e) {
        console.log("e : " + e);
      }

      const estimateGas = await web3.eth.estimateGas({
        from: user.eth_address,
        nonce: nonce.toString(),
        to: contractAddress,
        data: txData,
      });

      const txParams = [
        {
          from: user.eth_address,
          to: contractAddress,
          gas: estimateGas.toString(16),
          nonce: nonce.toString(),
          data: txData,
        },
      ];

      try {
        // metamaskにtxを認証するようにreqを飛ばしている
        const res = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: txParams,
        });
        alert("transaction id : " + res);
        console.log(res);
      } catch (e) {
        console.log(e);
        alert("ERROR : " + e);
      }
    },
