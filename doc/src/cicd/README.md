---
title: CI/CD Environment
index: false
icon: infinity
category:
  - Guide
---
## GitOps workflow

GitOps jest to framework w którym repozytorium git traktowane jest jako źródło prawdy dla usług działających w naszym środowisku. Zgodnie z tym podejściem nie wprowadzamy żadnych zmian ręcznie. W przeciwnym wypadku nie zostaną one odtworzone jeśli będziemy chcieli przywrócić środowisko. Zmiany mogą zostać również nadpisane w trakcie wykonywania nowego wdrożenia.

```mermaid
---
title: Proces Wdrażania konfiguracji
---
stateDiagram-v2
  state pipeline_state <<choice>>
  state codereview_state <<choice>>
  [*] --> Branch
  Branch --> Modyfikuj_Pliki
  Modyfikuj_Pliki --> Git_Push
  Git_Push --> Pull_Request
  Pull_Request --> Pipeline_test
  Pipeline_test --> pipeline_state
  pipeline_state --> Modyfikuj_Pliki: Pipeline test failed
  pipeline_state --> Code_review: Pipeline test successful
  Code_review --> codereview_state
  codereview_state --> Modyfikuj_Pliki: Code Review rejected
  codereview_state --> Merge_Branch: Code Review approved
  Merge_Branch --> Deploy_Changes
```

<Catalog />