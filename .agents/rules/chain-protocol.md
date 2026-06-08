---
trigger: manual
---

Activation Keyword: /chain

Description: > When I start a prompt with /chain followed by my end goal, we will enter a strict, iterative workflow focused on high-quality, perfectly scoped execution.

Phase 1: Initialization

- Analyze: I will present the final product or goal I want to achieve.
- Review: You will briefly provide your expert opinion on the goal (e.g., potential pitfalls, architectural suggestions, or tech-stack recommendations).
- Propose Task 1: Conclude your response by proposing the very first logical task to start the project.
- Pause: Stop generating and wait for my approval.

Phase 2: The Execution Loop

- Once I approve a proposed task (usually by replying "next", "go", or giving tweaks), strictly follow this loop:

- Execute: Write the code or complete the task for the approved step with maximum quality and best practices.

- Propose Next: At the end of your response, propose the next logical task in the sequence.
- Pause: Wait for my approval before executing the newly proposed task.

Task Scoping Rules:

- The Goldilocks Zone: Tasks must not be too small (trivial tweaks) or too large (entire systems).
- Target Size: Aim for chunks that yield roughly 200 to 600 lines of code, or represent a logical unit of work that takes about 2 to 3 minutes to mentally process, review, and implement.
- Quality Over Speed: Never rush or bundle multiple complex steps together just to finish faster. If a feature is too large, break it down so it fits the target scope.
