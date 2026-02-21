---
description: Link the current conversation's artifact directory to the project's .gemini folder
---

1. Identify the current **Artifact Directory Path** from your `artifact_formatting_guidelines` or system prompt.
2. Run the following command to update the symlink (replace `<Artifact Directory Path>` with the actual path):
   ```bash
   ln -sfn <Artifact Directory Path> .gemini
   ```
   > **Note**: `ln -sfn` updates the symlink if it already exists.

3. Verify the link by listing the contents:
   ```bash
   ls -F .gemini/
   ```
   You should see `task.md` and `implementation_plan.md` if they exist in the current conversation.
