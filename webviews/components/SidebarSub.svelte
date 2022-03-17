<!-- script is required for compilation -->
<script lang="ts">
  //   import { onMount } from "svelte";
  import * as jsonfile from "../tsconfig.json";

  const list = ["First element", "Second element", "Third element"];
  var fileContents = "";

  //   onMount(() => {
  //     window.addEventListener("message", (event) => {
  //       const message = event.data;
  //       if (message.type === "file") {
  //         fileContents = message.value;
  //       }
  //     });
  //   });
</script>

{#each list as item}
  <div class="container{list.indexOf(item) % 2 ? ' blue' : ' green'}">
    {item}
  </div>
{/each}

<div>{JSON.stringify(jsonfile)}</div>

<style>
  .container {
    text-align: center;
    height: 20px;
    width: 100%;
    cursor: pointer;
  }

  .blue {
    background-color: rgba(0, 0, 255, 0.219);
  }

  .green {
    background-color: rgba(0, 255, 0, 0.219);
  }
</style>
