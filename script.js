const tbody = document.querySelector("tbody");
const descItem = document.querySelector("#desc");
const amount = document.querySelector("#amount");
const type = document.querySelector("#type");
const date = document.querySelector("#date");
const btnNew = document.querySelector("#btnNew");
const btnSave = document.querySelector("#btnSave");
const btnLoad = document.querySelector("#btnLoad");

const incomes = document.querySelector(".incomes");
const expenses = document.querySelector(".expenses");
const total = document.querySelector(".total");

const pieChartElement = document.querySelector("#pieChart");
let pieChart;

let items = getItemsFromLocalStorage();

btnNew.onclick = () => {
  if (descItem.value === "" || amount.value === "" || type.value === "" || date.value === "") {
    return alert("Preencha todos os campos!");
  }

  items.push({
    desc: descItem.value,
    amount: Math.abs(amount.value).toFixed(2),
    type: type.value,
    date: date.value,
  });

  setItemsToLocalStorage();

  loadItems();

  descItem.value = "";
  amount.value = "";
  date.value = "";
};

btnSave.onclick = () => {
  const data = JSON.stringify(items);
  downloadFile(data, "data.txt");
};

btnLoad.onclick = () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".txt";

  fileInput.onchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const contents = e.target.result;
      const parsedData = JSON.parse(contents);
      items = parsedData;
      setItemsToLocalStorage();
      loadItems();
    };

    reader.readAsText(file);
  };

  fileInput.click();
};

function deleteItem(index) {
  items.splice(index, 1);
  setItemsToLocalStorage();
  loadItems();
}

function insertItem(item, index) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${item.desc}</td>
    <td>R$ ${item.amount}</td>
    <td class="columnType">${item.type === "Entrada" ? '<i class="bx bxs-chevron-up-circle"></i>' : '<i class="bx bxs-chevron-down-circle"></i>'}</td>
    <td class="columnDate">${item.date}</td>
    <td class="columnAction">
      <button onclick="deleteItem(${index})"><i class='bx bx-trash'></i></button>
    </td>
  `;

  tbody.appendChild(tr);
}

function loadItems() {
  tbody.innerHTML = "";
  items.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
  items.forEach((item, index) => {
    insertItem(item, index);
  });

  calculateTotals();
  updatePieChart();
}

function calculateTotals() {
  const amountIncomes = items
    .filter((item) => item.type === "Entrada")
    .map((transaction) => Number(transaction.amount));

  const amountExpenses = items
    .filter((item) => item.type === "Saída")
    .map((transaction) => Number(transaction.amount));

  const totalIncomes = amountIncomes.reduce((acc, cur) => acc + cur, 0).toFixed(2);
  const totalExpenses = Math.abs(amountExpenses.reduce((acc, cur) => acc + cur, 0)).toFixed(2);
  const totalItems = (totalIncomes - totalExpenses).toFixed(2);

  incomes.textContent = totalIncomes;
  expenses.textContent = totalExpenses;
  total.textContent = totalItems;
}

function updatePieChart() {
  const amountIncomes = items
    .filter((item) => item.type === "Entrada")
    .map((transaction) => Number(transaction.amount));

  const amountExpenses = items
    .filter((item) => item.type === "Saída")
    .map((transaction) => Number(transaction.amount));

  const data = {
    labels: ["Entradas", "Saídas"],
    datasets: [
      {
        data: [
          amountIncomes.reduce((acc, cur) => acc + cur, 0),
          amountExpenses.reduce((acc, cur) => acc + cur, 0),
        ],
        backgroundColor: ["#00FF00", "#D83121"],
      },
    ],
  };

  if (!pieChart) {
    pieChart = new Chart(pieChartElement, {
      type: "pie",
      data: data,
      options: {
        responsive: true,
      },
    });
  } else {
    pieChart.data = data;
    pieChart.update();
  }
}

function getItemsFromLocalStorage() {
  return JSON.parse(localStorage.getItem("db_items")) || [];
}

function setItemsToLocalStorage() {
  localStorage.setItem("db_items", JSON.stringify(items));
}

function downloadFile(data, filename) {
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

loadItems();
