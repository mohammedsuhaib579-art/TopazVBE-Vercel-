# Topaz-VBE Complete Implementation Plan

## Overview
This document outlines the complete implementation plan to match the Topaz-VBE manual exactly.

## Current Status
- File `app.py` is incomplete (ends at line 825)
- Basic structure exists but missing many manual features
- Need to implement all tables (1-23) and complete mechanics

## Implementation Tasks

### 1. Constants & Tables (Priority: HIGH)
- [x] Table 1: Market Statistics
- [x] Table 2: Marketing Costs
- [x] Table 3: Manufacturing Parameters
- [x] Table 4: Maintenance Costs
- [x] Table 5: Machine Hours per Shift
- [x] Table 6: Scrap Values
- [x] Table 7: Guarantee Servicing Charges
- [x] Table 8: Production Costs
- [x] Table 9: Vehicle Capacity
- [x] Table 10: Journey Times
- [x] Table 11: Transport Costs
- [x] Table 12: Warehousing & Purchasing
- [x] Table 13: Stock Calculation Methods
- [x] Table 14: Material Suppliers
- [x] Table 15: Personnel Costs
- [x] Table 16: Worker Hours & Shift Premiums
- [x] Table 17: Minimum Hours & Pay
- [x] Table 18: Fixed Assets
- [x] Table 19: Financial Limits
- [x] Table 20: Financial Parameters
- [x] Table 21: Stock Valuations
- [x] Table 22: Payment Timing
- [x] Table 23: Credit Discounts

### 2. Core Features Missing (Priority: HIGH)

#### Marketing
- [ ] Three types of advertising (Trade Press, Support, Merchandising) - currently only one
- [ ] Product development with MAJOR/MINOR/NONE outcomes
- [ ] Star ratings for products (1-5)
- [ ] Proper salespeople commission calculation (on orders, not sales)
- [ ] Sales office cost (1% of orders)

#### Operations
- [ ] Materials supplier system (4 suppliers with different terms)
- [ ] Delivery scheduling for materials (multiple deliveries)
- [ ] Proper material storage (factory + external)
- [ ] Machine purchasing with credit checks (3-quarter lead time)
- [ ] Machine ordering: 50% deposit, 50% on installation
- [ ] Vehicle depreciation and aging
- [ ] Proper transport calculation (mixed loads, vehicle capacity per product)

#### Personnel
- [ ] Recruitment delays (quarter after next)
- [ ] Training delays (9 per category per quarter limit)
- [ ] Strike system (48 hours per week per worker)
- [ ] Absenteeism mechanics
- [ ] Machinist surplus handling (only 50% dismissed per quarter)
- [ ] Parity payments for assembly workers
- [ ] Minimum paid hours for machinists (400 hours)

#### Finance
- [ ] Complete Balance Sheet
- [ ] Complete Cash Flow Statement
- [ ] Complete Profit & Loss Statement
- [ ] Debtors calculation (credit terms, collection delays)
- [ ] Creditors with proper timing (Table 22)
- [ ] Tax calculation (yearly, Q4 only, with loss carryforward)
- [ ] Overdraft limit calculation (Table 19)
- [ ] Creditworthiness for machine purchases
- [ ] Property asset (fixed value)
- [ ] Interest on average balances

### 3. Decision Form Structure (Priority: HIGH)
Need to match the exact Decision Form structure:
- [ ] Major product improvements (tick boxes)
- [ ] Prices (Export and Home, per product)
- [ ] Advertising (3 types × 3 products × 4 areas)
- [ ] Assembly time (single value or per product?)
- [ ] Salespeople allocation
- [ ] Sales remuneration (salary + commission %)
- [ ] Assembly wage rate
- [ ] Shift level
- [ ] Management budget
- [ ] Maintenance hours
- [ ] Dividend rate (pence per share)
- [ ] Credit days
- [ ] Vehicles (buy/sell)
- [ ] Information purchases (tick boxes)
- [ ] Deliveries (per product per area)
- [ ] Product development (per product)
- [ ] Salespeople actions (recruit/dismiss/train)
- [ ] Assembly workers actions (recruit/dismiss/train)
- [ ] Materials (quantity, supplier, deliveries)
- [ ] Machines (sell, order)

### 4. Management Report (Priority: HIGH)
Need to generate complete reports matching manual structure:
- [ ] Decisions made (with error indicators: +, #, *)
- [ ] Resources employed (machines, vehicles, hours)
- [ ] Product statistics (scheduled, produced, rejected, serviced, delivered, orders, sales, backlog, stocks, improvements)
- [ ] Accounts:
  - [ ] Overhead costs analysis
  - [ ] Profit and Loss Statement
  - [ ] Balance Sheet
  - [ ] Cash Flow Statement
- [ ] Information about all companies
- [ ] Economic Information

### 5. Advanced Mechanics (Priority: MEDIUM)
- [ ] Product improvements stacking (multiple MAJOR improvements)
- [ ] Stock write-off on major improvement implementation
- [ ] Backlog cancellation rules (50% base, more with price increase)
- [ ] Credit discount application (Table 23)
- [ ] Competitor AI improvements
- [ ] Share price calculation (more sophisticated)
- [ ] Machine efficiency degradation
- [ ] Vehicle age affecting availability

### 6. Streamlit UI (Priority: HIGH)
- [ ] Complete Decision Form matching manual layout
- [ ] Management Report display
- [ ] All competitors information
- [ ] Economic indicators
- [ ] Historical data visualization
- [ ] Error indicators for decisions

## Next Steps
1. Create complete constants module
2. Expand data classes to match all manual requirements
3. Implement complete simulation engine
4. Create complete Streamlit UI
5. Test all features against manual specifications

