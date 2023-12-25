import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTask, getAllTasks, reset } from "../../features/Tasks/taskSlice";
import { updateProject } from "../../features/Projects/projectSlice";
import { toast } from "react-toastify";
import Select from "react-select";
import Modal from "react-modal";
import { FaSpinner } from "react-icons/fa";
import { MdClose } from "react-icons/md";

Modal.setAppElement("#root");

const CreateTask = ({ onClose }) => {
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.task
  );
  const { users } = useSelector((state) => state.users);
  const { projects,projectDetail } = useSelector((state) => state.project);
  const project =  projects.find((project) => project._id === projectDetail._id);
  const [taskData, setTaskData] = useState({
    name: "",
    description: "",
    deadline: "",
    status: "To Do",
    assignee: "",
  });
  const [devTeamOption, setDevTeamOption] = useState([]);

  useEffect(() => {
    const devOptions = users
      .filter((user) => user.role === "Development Team")
      .map((user) => ({
        value: user._id,
        label: user.username,
      }));
    setDevTeamOption(devOptions);
  }, [users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

  };

  const handleTeamMemeberChange = (selectedOption) => {
    setTaskData((prevData) => ({
        ...prevData,
        assignee: selectedOption,
      }));
  };

  const handleFormSubmit = async(e) => {
    e.preventDefault();
    const devTeamID = taskData.assignee && taskData.assignee.value
    dispatch(
      createTask({
        ...taskData,
        assignee: devTeamID,
      })
    );

    if (isError) {
      toast.error(message);
      dispatch(reset());
    }
    if (isSuccess) {
      onClose();
      toast.success("Task created successfully");
      const newTaskId = message;
      const project_id = projectDetail._id
      const updatedTasks = [...project.tasks, newTaskId];
      const updatedProject = {
        ...project,
        tasks: updatedTasks,
      };
      await dispatch(updateProject({ projectData:updatedProject, project_id }))
      await dispatch(getAllTasks)
      dispatch(reset());
    }
  };

  return (
    <Modal
      isOpen={true}
      contentLabel="Create New Task"
      className="fixed top-0 left-0 w-full h-full flex justify-center items-center"
      overlayClassName="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
    >
      <div className="bg-white text-black p-8 mx-12 shadow-md shadow-dark-blue rounded-xl">
        <div className="flex justify-end">
          <MdClose size={30} onClick={onClose} />
        </div>
        <h2 className="font-bold text-2xl text-center">Create New Project</h2>
        {isLoading && <FaSpinner />}
        <form
          onSubmit={handleFormSubmit}
          className="p-8 shadow-lg rounded-md flex flex-col "
        >
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={taskData.name}
            onChange={handleInputChange}
            className="border border-gray rounded-md  py-1 focus:outline-blue"
            required
          />
          <label htmlFor="description">Start Date: </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={taskData.deadline}
            onChange={handleInputChange}
            className="border border-gray rounded-md  py-1 focus:outline-blue"
            required
          />
          <label htmlFor="description" className="flex flex-col  mt-2">
            Description:
            <textarea
              rows={5}
              id="description"
              name="description"
              value={taskData.description}
              onChange={handleInputChange}
              className="border border-gray rounded-md  py-1 focus:outline-blue"
              required
            />
          </label>
          <label htmlFor="teamMembers" className="pt-4">
            Development Team:
          </label>
          <Select
            id="teamMembers"
            name="teamMembers"
            value={taskData.assignee}
            onChange={handleTeamMemeberChange}
            options={devTeamOption}
          />
          <div className="flex justify-center my-2">
            <button
              type="submit"
              className="p-2 border rounded-md border-olive-green text-olive-green font-bold hover:bg-olive-green hover:text-white"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateTask;
