# Concepts

 > These are some concepts to what would be good addition to node-notebook

- Be able to save code snippets to accounts?
    - just save reference to the notebook key to the accounts for now
    - be able to have notebooks referenced to user account have named hashes
        - ex: /{username}/{hash}
 - Running asynchonous code
    - running a server in a notebook, something that requires a forever loop or the spawn of a new process
- Being able to transform data
    - arrays of objects to a table
    - arrays of arrays to a graph
    - location data to be displayed on a map
    - being able to view canvas or buffer data
- Be able to give the notebook a code snippet and ask it to seed the data?
- Be able to give the notebook a code snippet and ask it to run regression over the code paths to optimize it and point out where optimizations can be done
- Be able to have two or more code snippets and compare the output between the three over time as data is being added or removed to see how well they perform
- Be able to run code in specific vms? (might need to dehydrate heap and rehydrate onto different vm?)  
    - Use docker as host for the node instance and call it when needed 
