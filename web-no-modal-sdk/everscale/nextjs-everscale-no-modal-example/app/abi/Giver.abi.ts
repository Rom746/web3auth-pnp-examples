export const GiverContract = {
  abi: {
      "ABI version": 2,
      header: ["time", "expire"],
      functions: [
          {
              name: "sendTransaction",
              inputs: [
                  {
                      "name": "dest",
                      "type": "address",
                  },
                  {
                      "name": "value",
                      "type": "uint128",
                  },
                  {
                      "name": "bounce",
                      "type": "bool",
                  },
              ],
              outputs: [],
          },
          {
              name: "getMessages",
              inputs: [],
              outputs: [
                  {
                      components: [
                          {
                              name: "hash",
                              type: "uint256",
                          },
                          {
                              name: "expireAt",
                              type: "uint64",
                          },
                      ],
                      name: "messages",
                      type: "tuple[]",
                  },
              ],
          },
          {
              name: "upgrade",
              inputs: [
                  {
                      name: "newcode",
                      type: "cell",
                  },
              ],
              outputs: [],
          },
          {
              name: "constructor",
              inputs: [],
              outputs: [],
          },
      ],
      data: [],
      events: [],
  },
};