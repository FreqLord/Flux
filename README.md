# Flux
Financial stability platform for freelancers and gig workers, designed to manage irregular income through forecasting, spending insights, and safety buffers.


Flux is a project we built to support people who earn through irregular or variable income streams such as freelancers, gig workers, and independent professionals. Traditional finance tools assume a stable salary, which often makes them less useful for people whose earnings fluctuate week to week. Flux approaches this differently by focusing on **financial stability and decision-making under uncertain income**, helping users understand how their earnings, spending, and savings interact over time. 

The platform provides a structured overview of personal finances through several connected modules. The **Dashboard** offers a quick snapshot of income, spending progress, financial runway, and recent activity so users can understand their current financial position at a glance. The **Spending section** tracks how quickly money is being used during the month and highlights safe spending limits to avoid overshooting budgets.

Flux also includes an **Income Forecast view** that visualizes potential earning opportunities across the month through probability-based calendars and projections, helping users anticipate stronger and quieter work periods. A **Break Planner** models the financial impact of taking time off, allowing users to estimate how a planned break would affect their runway and expenses before committing.

To help manage uncertainty, the system also introduces a **Safety Vault**, which acts as a financial buffer by storing surplus funds from higher-income periods and providing protection during slower ones. Additional sections like **Profile & Settings** allow users to define goals, targets, and preferences that shape how the system calculates and displays financial insights.


## AI Forecast Model
![Flux Forecast AI](assets/flux%20forecast%20ai.jpeg)
<p align="center">https://github.com/FreqLord/Flux_AI - link to repository.</p>

Alongside the application, a predictive modeling component was developed using **NeuralProphet and XGBoost** to analyze historical income patterns and generate probabilistic forecasts of future earnings. Prophet handles the time-series aspects such as trends and seasonality, while XGBoost captures nonlinear relationships and improves prediction accuracy through gradient-boosted decision trees. Together, these models help estimate likely earning windows and income ranges that can support more informed financial planning.


## Features
- Financial dashboard overview
- Spending pacing and category tracking
- Income forecasting visualization
- Break planning simulation
- Safety vault for financial buffers
- Mobile-friendly interface
- Ai chat for instant overview

## Contributors

**Akash Vishwakarma**  
Product design, UI/UX, and frontend development  
GitHub: https://github.com/AkashV31

**Shreyash Tiwari**  
Design and frontend collaboration  
GitHub: https://github.com/Shreyash-17-10

**Sushil Singh**  
Predictive modeling using Prophet and XGBoost  
GitHub: https://github.com/FreqLord
