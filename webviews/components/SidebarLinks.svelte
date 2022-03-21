<!-- script is required for compilation -->
<script lang="ts">
  import { onMount } from "svelte";

  tsvscode.postMessage({
    type: "requestForConfigLinks",
    value: "",
  });

  let deleteIconSrc =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KIDx0aXRsZS8+CgogPGc+CiAgPHRpdGxlPmJhY2tncm91bmQ8L3RpdGxlPgogIDxyZWN0IGZpbGw9Im5vbmUiIGlkPSJjYW52YXNfYmFja2dyb3VuZCIgaGVpZ2h0PSI0MDIiIHdpZHRoPSI1ODIiIHk9Ii0xIiB4PSItMSIvPgogPC9nPgogPGc+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxwYXRoIGZpbGw9IiNhMDFjMWMiIGlkPSJzdmdfMSIgZD0ibTM1Ni42NSw0NTBsLTE4NS4xOCwwYTQxLDQxIDAgMCAxIC00MC45LC00MC45bDAsLTI4OC40NGExNSwxNSAwIDAgMSAxNSwtMTVsMjM3LDBhMTUsMTUgMCAwIDEgMTUsMTVsMCwyODguNDRhNDEsNDEgMCAwIDEgLTQwLjkyLDQwLjl6bS0xOTYuMDgsLTMxNC4zNGwwLDI3My40NGExMC45MSwxMC45MSAwIDAgMCAxMC45LDEwLjlsMTg1LjE4LDBhMTAuOTEsMTAuOTEgMCAwIDAgMTAuOTEsLTEwLjlsMCwtMjczLjQ0bC0yMDYuOTksMHoiLz4KICA8cGF0aCBmaWxsPSIjYTAxYzFjIiBpZD0ic3ZnXzIiIGQ9Im0zMjcuMDYsMTM1LjY2bC0xMjYsMGExNSwxNSAwIDAgMSAtMTUsLTE1bDAsLTI3LjI2YTQ0Ljc5LDQ0Ljc5IDAgMCAxIDQ0Ljc0LC00NC43M2w2Ni41MiwwYTQ0Ljc5LDQ0Ljc5IDAgMCAxIDQ0Ljc0LDQ0LjczbDAsMjcuMjZhMTUsMTUgMCAwIDEgLTE1LDE1em0tMTExLC0zMGw5NiwwbDAsLTEyLjI2YTE0Ljc1LDE0Ljc1IDAgMCAwIC0xNC43NCwtMTQuNzNsLTY2LjUyLDBhMTQuNzUsMTQuNzUgMCAwIDAgLTE0LjczLDE0LjczbC0wLjAxLDEyLjI2eiIvPgogIDxwYXRoIGZpbGw9IiNhMDFjMWMiIGlkPSJzdmdfMyIgZD0ibTI2NC4wNiwzOTIuNThhMTUsMTUgMCAwIDEgLTE1LC0xNWwwLC0xOTkuNDlhMTUsMTUgMCAxIDEgMzAsMGwwLDE5OS40OWExNSwxNSAwIDAgMSAtMTUsMTV6Ii8+CiAgPHBhdGggZmlsbD0iI2EwMWMxYyIgaWQ9InN2Z182IiBkPSJtNDA1LjgxLDEzNS42NmwtMjgzLjQ5LDBhMTUsMTUgMCAwIDEgMCwtMzBsMjgzLjQ5LDBhMTUsMTUgMCAwIDEgMCwzMHoiLz4KIDwvZz4KPC9zdmc+";

  var links: any[] = [];

  const handleRemove = (index: any) => {
    links.splice(index, 1);
    refs.splice(index, 1);
    links = links;
    tsvscode.postMessage({
      type: "updateConfigLinks",
      value: links,
    });
  };

  let _refs: any[] = [];
  $: refs = _refs.filter((el) => el);

  const formatString = (val: {
    string: string;
    startLine: string;
    endLine: string;
    startCharacter: string;
    endCharacter: string;
    filepath: string;
  }) => {
    if (val.string.length >= 20) {
      return (
        val.string.substring(0, 8) +
        " ...... " +
        val.string.substring(val.string.length - 8, val.string.length)
      );
    }
    return val.string;
  };

  const formatLineNo = (val: {
    string: string;
    startLine: string;
    endLine: string;
    startCharacter: string;
    endCharacter: string;
    filepath: string;
  }) => {
    let str = "【" + (val.startLine + 1) + " - " + (val.endLine + 1) + "】";
    return str;
  };

  onMount(() => {
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.type === "requestForLinks") {
        console.log("value:", message.value);
      } else if (message.type === "configLinks") {
        links = message.value;
      }
    });
  });
</script>

{#each links as item}
  <div class="container-item">
    <div class="main-item" bind:this={_refs[links.indexOf(item)]}>
      <span class="title">Link {links.indexOf(item) + 1}</span>
      <img
        class="main-img"
        src={deleteIconSrc}
        alt="delete"
        on:click={() => {
          handleRemove(links.indexOf(item));
        }}
      />
    </div>
    <div>
      <div
        class="blue"
        on:click={() => {
          // send file name as well
          tsvscode.postMessage({
            type: "gotoLine",
            value: {
              startLine: item[0].startLine,
              endLine: item[0].endLine,
              filepath: item[0].filepath,
              type: 0,
            },
          });
        }}
      >
        <span class="line-number">{formatLineNo(item[0])}</span>
        <i>{formatString(item[0])}</i>
      </div>
      <div
        class="green"
        on:click={() => {
          // send file name as well
          tsvscode.postMessage({
            type: "gotoLine",
            value: {
              startLine: item[1].startLine,
              endLine: item[1].endLine,
              filepath: item[1].filepath,
              type: 1,
            },
          });
        }}
      >
        <span class="line-number">{formatLineNo(item[1])}</span>
        <i>{formatString(item[1])}</i>
      </div>
    </div>
  </div>
{/each}

<style>
  .container-item {
    margin-bottom: 10px;
  }
  .blue {
    background-color: rgba(0, 0, 255, 0.151);
    cursor: pointer;
    padding: 2px;
  }
  .green {
    background-color: rgba(0, 255, 0, 0.151);
    cursor: pointer;
    padding: 2px;
  }
  .main-item {
    background-color: rgba(0, 0, 0, 0.151);
    width: 100%;
    padding: 2px;
    border: 1px solid rgba(0, 0, 0);
  }
  .main-img {
    width: 18px;
    height: 18px;
    float: right;
    cursor: pointer;
  }
  .title {
    padding: 2px;
  }
  .line-number {
    font-size: 10px;
  }
</style>
