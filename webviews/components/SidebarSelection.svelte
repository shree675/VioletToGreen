<script lang="ts">
  import { onMount } from "svelte";

  var text1 = "";
  var text2 = "";

  const formatString = (val: {
    string: string;
    startLine: string;
    endLine: string;
  }) => {
    let str = "【" + (val.startLine + 1) + " - " + (val.endLine + 1) + "】";
    if (val.string.length >= 20) {
      return (
        str +
        "( " +
        val.string.substring(0, 8) +
        " ...... " +
        val.string.substring(val.string.length - 8, val.string.length) +
        " )"
      );
    }
    return str + "( " + val.string + " )";
  };

  onMount(() => {
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.type === "responseSelection" && message.value.string !== "") {
        if (text1 === "") {
          text1 = formatString(message.value);
        } else {
          text2 = formatString(message.value);
        }
      }
    });
  });
</script>

<div class="container">
  <div class="information">
    Select a piece of text (comment or code) and click on <b>Select</b> to mark for
    selection and link the two pieces of text.
  </div>

  {#if text2 === ""}
    <div class="link-clear-buttons">
      <button
        type="button"
        class="left"
        on:click={() => {
          text1 = "";
          text2 = "";
          tsvscode.postMessage({
            type: "requestForLinks",
            value: "Request for links",
          });
        }}>Clear</button
      >
      <button
        class="right"
        on:click={() => {
          tsvscode.postMessage({
            type: "requestSelection",
            value: "Request to obtain selected text",
          });
        }}>Select</button
      >
    </div>
  {:else}
    <div class="link-clear-buttons">
      <button
        type="button"
        class="left"
        on:click={() => {
          text1 = "";
          text2 = "";
        }}>Clear</button
      >
      <button
        type="button"
        class="right"
        on:click={() => {
          console.log("Linked successfully");
          text1 = "";
          text2 = "";
        }}>Link</button
      >
    </div>
  {/if}

  <input class="input" type="text" bind:value={text1} readonly />
  <input class="input" type="text" bind:value={text2} readonly />
</div>

<style>
  .container {
    font-size: 12px;
  }
  .information {
    padding-bottom: 5px;
  }
  .link-clear-buttons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }
  .left {
    flex: 1;
    margin-right: 2px;
  }
  .right {
    flex: 1;
    margin-left: 2px;
  }
  .input {
    margin-bottom: 5px;
  }
</style>
