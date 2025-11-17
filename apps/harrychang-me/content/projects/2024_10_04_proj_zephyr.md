---
title: "Zephyr: Fully Automated Ticket-Grabbing Bot"
category: "Web Automation"
subcategory: "Computer Vision"
description: "A fully automated ticket-grabbing bot designed specifically for the Tixcraft ticketing website, integrating Selenium and a custom-trained CNN model to automatically solve CAPTCHAs."
imageUrl: "images/optimized/projects/2024_10_04_zephyr/titlecard.webp"
year: "2024"
date: "2024-10-04"
role: "Sole Developer"
technologies: ["PyTorch", "Selenium"]
pinned: 10
featured: true
---

## Project Overview

Zephyr is a fully automated ticket-grabbing bot designed for the Tixcraft ticketing website. It integrates the Selenium automation tool with a custom-trained CNN model to automate the entire process, from selecting the event, area, and number of tickets to solving the CAPTCHA and proceeding to the checkout page.

The core design of this project focuses on high efficiency and stability. It maximizes the probability of successfully purchasing tickets through multithreading, random delays to simulate human behavior, and a sophisticated error-handling mechanism.

![Zephyr in Action (Logged Out)](https://drive.google.com/file/d/1imDvKqCPAYGSzrnU0QTaSFk43AdxTkBc/view?usp=sharing)

---

## Implementation Details

### Model Training

CAPTCHA authentication is the most critical challenge in the ticket-grabbing process, and often the most challenging and time-consuming phase for human users. To overcome this, I developed an efficient CNN model, with a training process divided into several stages:

**Sources of Base Training Data**:
1.  **Web Scraper**: I wrote an automated scraper to collect a large number of real CAPTCHA images from the Tixcraft [CAPTCHA training website](https://webbboxx.com/), creating a foundational database.
2.  **Data Generation**: To expand the dataset and ensure label accuracy, I also developed an additional program to generate synthetic images with features closely resembling real CAPTCHAs.

**Model Architecture**:
The core of the model is a Convolutional Neural Network. The architecture has been continuously optimized since the initial version. Later versions introduced deeper network layers, Batch Normalization to accelerate convergence, and Dropout layers to prevent overfitting, all of which improved the model's accuracy and generalization capabilities.

**Later Stage Training Method (Fine-Tuning)**:
To handle difficult cases encountered by the model in real-world scenarios, I designed a semi-automated improvement workflow:
1.  **Error Case Collection**: If Zephyr fails to recognize a CAPTCHA during execution, it automatically saves the image to a specific folder.
2.  **Manual Labeling and Retraining**: I would manually label these collected "error cases" and add them to the training set to fine-tune the existing model. This continuous iterative process allowed the model to learn more complex and ambiguous patterns, pushing its accuracy toward perfection.

**Final Achieved Performance**:
After multiple rounds of training and optimization, the model achieved extremely high recognition accuracy and very fast prediction speeds. This ensures that the CAPTCHA-solving step does not become a bottleneck in the time-sensitive ticket-grabbing process.

![Zephyr Training Screenshot](images/optimized/projects/2024_10_04_zephyr/zephyr_training_screen_shot.webp)

### Execution Flow

Zephyr's automated workflow is meticulously designed to ensure stability and efficiency.

**Configuration Method**:
The bot's behavior is driven by a JSON configuration file. Users can customize:
-   `event_url`: The URL of the event page.
-   `ticket_number`: The number of tickets to purchase.
-   `desired_areas`: A list of keywords for desired seating areas, arranged in order of priority.
-   `shift`: A list corresponding to `desired_areas`. This parameter solves the problem of duplicate area names (for example, multiple "Area A" links). `shift: [0]` means clicking the first matching area, while `shift: [1]` means clicking the second, and so on.

**Features Added for Stability**:
Rather than purely pursuing speed, Zephyr prioritizes stability in a real-world environment. To achieve this, I incorporated several mechanisms to simulate human actions and handle unexpected situations:
1.  **Simulating Human Behavior**: The program inserts a `random_sleep` with a small, random delay between operations like clicking and typing to avoid being detected as a bot.
2.  **Multithreading**: While selecting the number of tickets, the program calls the CNN model in a separate thread to recognize the CAPTCHA. These two time-consuming operations run in parallel, significantly reducing the overall process time.
3.  **Sophisticated Error and Alert Handling**: The code includes extensive error-handling logic. For example, an `@alert_handler` is used to automatically manage various web alerts (like "Incorrect CAPTCHA" or "No contiguous seats available in this area") and determines the next action based on the alert's content (for example, re-entering the CAPTCHA or switching to another area).
4.  **Robust Element Interaction**: It uses Selenium's `WebDriverWait` to ensure elements are fully loaded before interaction and employs `ActionChains` to simulate mouse hovering and other actions. This handles dynamically loaded web content and effectively avoids common errors like `ElementClickInterceptedException`.

![Example of a successful run as a proof-of-concept](images/optimized/projects/2024_10_04_zephyr/successful_purchase.webp)

---

## Disclaimer

This project, "Zephyr," is intended for personal learning and technical research only. It aims to explore the integrated application of web automation, computer vision, and machine learning. The purpose of developing this project is purely for academic exploration and to enhance personal development skills.

Any successful results shown in the project (such as ticket screenshots) are part of functional testing and proof-of-concept, not for actual commercial or personal gain. All sensitive information in the displayed images has been blurred to align with the academic research purpose of this disclaimer.

All code and related resources are retained by the developer. Please refrain from asking for the source code or the final product. Any application of this project's concepts or techniques to actual ticket purchasing, or any action that violates the terms of use of the ticketing platform, is not associated with the developer.
