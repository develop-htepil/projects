const tbody = document.querySelector("tbody");
const descItem = document.querySelector("#desc");
const amount = document.querySelector("#amount");
const type = document.querySelector("#type");
const btnNew = document.querySelector("#btnNew");

const incomes = document.querySelector(".incomes");
const expenses = document.querySelector(".expenses");
const total = document.querySelector(".total");

let items;

btnNew.onclick = () => {
  if (descItem.value === "" || amount.value === "" || type.value === "") {
    return alert("Preencha todos os campos!");
  }

  items.push({
    desc: descItem.value,
    amount: Math.abs(amount.value).toFixed(2),
    type: type.value,
  });

  setItemsToLocalStorage();

  loadItems();

  descItem.value = "";
  amount.value = "";

  renderPieChart(); // Atualiza o gráfico após a inclusão de um novo valor
};

function deleteItem(index) {
  items.splice(index, 1);
  setItemsToLocalStorage();
  loadItems();

  renderPieChart(); // Atualiza o gráfico após a exclusão de um valor
}

function insertItem(item, index) {
  let tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${item.desc}</td>
    <td>R$ ${item.amount}</td>
    <td class="columnType">${
    item.type === "Entrada"
      ? '<i class="bx bxs-chevron-up-circle"></i>'
      : '<i class="bx bxs-chevron-down-circle"></i>'
    }</td>
    <td class="columnAction">
      <button onclick="deleteItem(${index})"><i class='bx bx-trash'></i></button>
    </td>
  `;

  tbody.appendChild(tr);

  renderPieChart(); // Atualiza o gráfico após a inclusão de um novo valor
}

function loadItems() {
  items = getItemsFromLocalStorage();
  tbody.innerHTML = "";
  items.forEach((item, index) => {
    insertItem(item, index);
  });

  calculateTotals();
}

function calculateTotals() {
  const amountIncomes = items
    .filter((item) => item.type === "Entrada")
    .map((transaction) => Number(transaction.amount));

  const amountExpenses = items
    .filter((item) => item.type === "Saída")
    .map((transaction) => Number(transaction.amount));

  const totalIncomes = amountIncomes.reduce((acc, item) => acc + item, 0);
  const totalExpenses = amountExpenses.reduce((acc, item) => acc + item, 0);

  incomes.textContent = totalIncomes.toFixed(2);
  expenses.textContent = totalExpenses.toFixed(2);
  total.textContent = (totalIncomes - totalExpenses).toFixed(2);
}

function renderPieChart() {
  const ctx = document.getElementById("pieChart").getContext("2d");

  const labels = items.map((item) => item.desc);
  const amounts = items.map((item) => Number(item.amount));

  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#D9418C",
    "#4BC0C0",
    "#FF9F40",
    "#9966FF",
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
  ];

  const data = {
    labels: labels,
    datasets: [
      {
        data: amounts,
        backgroundColor: colors,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
  };

  // Remove o gráfico anterior (se existir) antes de renderizar um novo
  const existingChart = Chart.getChart(ctx);
  if (existingChart) {
    existingChart.destroy();
  }

  new Chart(ctx, {
    type: "pie",
    data: data,
    options: options,
  });
}

function setItemsToLocalStorage() {
  localStorage.setItem("items", JSON.stringify(items));
}

function getItemsFromLocalStorage() {
  const localStorageItems = localStorage.getItem("items");

  return localStorageItems ? JSON.parse(localStorageItems) : [];
}

loadItems();
