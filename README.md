**Tech Stack**

*   frontend: ReactJs, typescript and vite
*   backend: node, ExpressJs and typescript
*   Database: PostgreSQL
*   ORM: Prisma

**why I chose this stack?**

*   Invoices would be a structured data file so decided to go with a SQL database.
*   used typescript to make the code typesafe and also more scalable if needed.
*   used prisma to speed up development and also improve security.

**Assumptions**

*   user will only update the price and quantity when editing an existing invoice
*   user can choose to not add taxes
*   calculation had to be shown while creating an invoice

**Helpful link**
*   figma design i built before getting started [link](https://www.figma.com/design/XTC04R6Ukqvu0QQ4N4iYyH/Invoice-Generator?node-id=0-1&t=Y83lPq9EJ4VGGpKL-1)

***Db relationship**
*   Relationships:
    Invoice to ListItem:

    One-to-Many: An invoice can have multiple list items.
    Defined by the ListItem model's invoiceId field, which references the Invoice model's id field.
    ListItem to Tax:

    One-to-Many: A list item can have multiple taxes.
    Defined by the Tax model's listItemId field, which references the ListItem model's id field.

**How to build**

```plaintext
git clone https://github.com/sharabhh/invoice-generator.git
```

steps

1.  open the folder then type
    
    ```plaintext
    cd .\backend\
    npm install
    tsc -b
    node dist/indes.js
    ```
    
2.  open another terminal tab
    
    ```plaintext
    cd .\frontend\
    npm install
    npm run dev
    ```