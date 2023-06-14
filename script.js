const tbody = document.querySelector("tbody");
const descItem = document.querySelector("#desc");
const amount = document.querySelector("#amount");
const type = document.querySelector("#type");
const date = document.querySelector("#date");
const btnNew = document.querySelector("#btnNew");
const btnSave = document.querySelector("#btnSave");
const btnLoad = document.querySelector("#btnLoad");
const btnFilter = document.querySelector("#btnFilter");
const startDateInput = document.querySelector("#startDate");
const endDateInput = document.querySelector("#endDate");

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

btnFilter.onclick = () => {
  loadItems();
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
  const startDate = new Date(startDateInput.value); // Converter para objeto Date
  const endDate = new Date(endDateInput.value); // Converter para objeto Date

  tbody.innerHTML = "";
  const filteredItems = items.filter(item => {
    const itemDate = new Date(item.date); // Converter para objeto Date
    return itemDate >= startDate && itemDate <= endDate;
  });
  filteredItems.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
  filteredItems.forEach((item, index) => {
    insertItem(item, index);
  });

  calculateTotals(filteredItems);
  updatePieChart(filteredItems);
}

function calculateTotals(filteredItems) {
  const totalIncomes = filteredItems.reduce((total, item) => {
    if (item.type === "Entrada") {
      return total + parseFloat(item.amount);
    }
    return total;
  }, 0);

  const totalExpenses = filteredItems.reduce((total, item) => {
    if (item.type === "Saída") {
      return total + parseFloat(item.amount);
    }
    return total;
  }, 0);

  const totalAmount = totalIncomes - totalExpenses;

  incomes.textContent = totalIncomes.toFixed(2);
  expenses.textContent = totalExpenses.toFixed(2);
  total.textContent = totalAmount.toFixed(2);
}

function updatePieChart(filteredItems) {
  const labels = ["Entradas", "Saídas"];
  const data = [0, 0];

  filteredItems.forEach((item) => {
    if (item.type === "Entrada") {
      data[0] += parseFloat(item.amount);
    } else if (item.type === "Saída") {
      data[1] += parseFloat(item.amount);
    }
  });

  if (pieChart) {
    pieChart.data.labels = labels;
    pieChart.data.datasets[0].data = data;
    pieChart.update();
  } else {
    pieChart = new Chart(pieChartElement, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ["#42b883", "#f34c44"],
          },
        ],
      },
    });
  }
}

function setItemsToLocalStorage() {
  localStorage.setItem("items", JSON.stringify(items));
}

function getItemsFromLocalStorage() {
  const savedItems = localStorage.getItem("items");

  if (savedItems) {
    return JSON.parse(savedItems);
  }

  return [];
}

function downloadFile(data, filename) {
  const file = new Blob([data], { type: "text/plain" });

  const a = document.createElement("a");
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

loadItems();
