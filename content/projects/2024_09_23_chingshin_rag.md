---
title: "Chingshin RAGi"
category: "Full-Stack Development"
subcategory: "School Project"
description: "A custom chatbot based on RAG, built with Svelte, PyTorch, and FastAPI, without using monolithic frameworks like LangChain."
imageUrl: "images/optimized/projects/2024_09_23_chingshing_ragi/titlecard.webp"
year: "2023-2024"
date: "2024-09-23"
role: "Designer & Developer"
technologies: ["Svelte", "PyTorch", "FastAPI"]
pinned: 6
featured: true
---

## Project Overview
Chingshin RAGi originated from our observation of the inefficient resource allocation in the school's administrative system. As a private school, Chingshin Academy has limited public visibility. Students and parents often have questions about school policies, and the complex website navigation makes finding information difficult. We saw this as an excellent opportunity to gain development experience by building a custom chatbot using RAG technology, completely avoiding all-in-one frameworks like LangChain.

The project was initially mentored by Ak. I was primarily responsible for building the back-end SQLite database, developing the vector retrieval system, and later, optimizing the user interface. Ultimately, this project won the **Grand Award** at the [**GenAI Stars Competition**](https://genaistars.org.tw/news/35), hosted by the **National Science and Technology Council**, and we represented Chingshin to present it entirely in English at the Advantech Foundation ACT Forum.

---

## Implementation Details

### Database
The database is the foundation of the RAG system, storing both the vector embedding indexes and the full content of each data entry.

- We opted against using vector databases like Pinecone or ChromaDB, instead using **SQLite** and storing vector embeddings in **JSON format** for greater flexibility.
- Initially, we tried to extract the last hidden layer from **TAIDE-7B** using PyTorch, hoping to unify the embedding and generation tasks, but the model's performance and accuracy were unsatisfactory.
- We later switched to a dedicated embedding model, **bge-small-zh-v1.5**, which significantly improved both speed and precision.
- We used **BeautifulSoup (BS4)** to crawl the school's website content and automated the process of importing it into the database.

### Search Engine
We implemented a **hybrid search engine** that combines lexical search and semantic search:

- **Lexical Search**: Responds quickly and excels at handling keyword queries; uses BM25 for ranking.
- **Semantic Search**: Understands natural language queries using vector embeddings.
- Later in development, we introduced **HNSWlib** and **multi-threading** for optimization, which significantly reduced search latency.
- We used **spaCy** for NER as a preliminary step to determine user intent and dynamically select the most suitable search strategy.

### API Module
- Built with **FastAPI**, chosen for its high performance and excellent support for **WebSocket**.
- Initially, we used the **Gemini API** for cost-effectiveness.
- Later, we migrated to the **OpenAI API** due to its faster response startup times.
- After the migration, we enabled **streaming responses**, which greatly improved the user experience.

### Front-end
- The front-end was built with **Svelte**, known for its high development efficiency, lightweight nature, and excellent performance, making it suitable for small-scale applications.
- A **drop-down menu** was added late in development to enhance the interactive experience.

---

## Project Promotion

### Presentation Design
During preparation for the final competition, I established a new visual language from scratch using Affinity Designer. The Chinese version of the presentation utilized the monospaced characteristics of Chinese characters to achieve visual balance, with a font combination of **Source Han Serif** for the body text and **Lan Ting Hei** for titles. I also created a full English version for the Advantech Foundation ACT Forum, strengthening its connection to the SDGs (Though, I still prefer the aesthetics of the Chinese version).

![Chinese Presentation Slides](images/optimized/projects/2024_09_23_chingshing_ragi/rag_chinese_slides.webp)
![English Presentation Slides](images/optimized/projects/2024_09_23_chingshing_ragi/rag_english_slides.webp)

### Video Design
To participate in the GenAI Stars Competition, I produced a short introductory video showcasing the functions and features of Chingshin RAGi, covering the design philosophy and a simple demonstration.
![Chingshin RAGi Introduction Video](https://drive.google.com/file/d/1A833CcgTPK7o6xh1lr7BhCPZIABs1oLc/view?usp=sharing)

---

## Acknowledgements
I want to thank my outstanding team members, especially our PM Chaney for the hard work on coordination and various tasks, and Raymond for his contributions to the FastAPI module. Thank you to Ak for the initial guidance and support, and also to Director Lin Yi-Ping for her trust and encouragement in this project. This project not only deepened our technical skills but also allowed us to truly experience the value and potential of RAG technology in a practical setting.
